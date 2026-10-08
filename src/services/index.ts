/**
 * Data access layer, backed by Postgres (src/db). Restaurant data is always read and
 * written through a restaurantId; provider-wide reads are grouped at the end.
 * Components never touch the database or the demo generators directly.
 *
 * Every read waits for a request (`connection()`), so pages are never frozen at
 * build time and the build never needs the database.
 */
import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, gte, lt, sql } from "drizzle-orm";
import { connection } from "next/server";
import { mockActivity, mockAnalyticsWeeks, mockMetrics, mockPreviewSamples, mockWeekdayShare } from "@/data/mock";
import { getDb, schema } from "@/db";
import { addDays, formatRelativeDay } from "@/lib/utils";
import type {
  Activity, Customer, DashboardMetric, EditableProgramField, LoyaltyCardPreviewData, LoyaltyProgram, Promotion,
  PromotionStatus, PromotionWithStatus, Redemption, Restaurant, RestaurantAnalytics, RestaurantProfile,
  RestaurantSettings, RestaurantSummary,
} from "@/types";

const { customers, loyaltyCards, loyaltyPrograms, promotions, redemptions, restaurantProfiles, restaurants } = schema;

async function db() {
  await connection();
  return getDb();
}

/** Today's date (YYYY-MM-DD, UTC). Waits for a request so the date is never frozen at build time. */
export async function getToday(): Promise<string> {
  await connection();
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Row -> domain type mapping

type ProgramRow = typeof loyaltyPrograms.$inferSelect;
type CustomerRow = typeof customers.$inferSelect;

const EDITABLE_FIELDS: EditableProgramField[] = ["rewardDescription", "expiresInDays"];

function toProgram(row: ProgramRow): LoyaltyProgram {
  const { id, restaurantId, stampsRequired, rewardTitle, rewardDescription, expiresInDays } = row;
  return { id, restaurantId, stampsRequired, rewardTitle, rewardDescription, expiresInDays };
}

function toCustomer({ lastVisitAt, ...row }: CustomerRow, today: string): Customer {
  return { ...row, lastVisit: formatRelativeDay(lastVisitAt, today) };
}

// ---------------------------------------------------------------------------
// Restaurants

export async function listRestaurants(): Promise<Restaurant[]> {
  return (await db()).select().from(restaurants).orderBy(asc(restaurants.name));
}

export async function getRestaurant(restaurantId: string): Promise<Restaurant | null> {
  const [row] = await (await db()).select().from(restaurants).where(eq(restaurants.id, restaurantId));
  return row ?? null;
}

// ---------------------------------------------------------------------------
// Dashboard (demo figures, except the live promotion count)

export async function getDashboardMetrics(restaurantId: string): Promise<DashboardMetric[]> {
  const metrics = mockMetrics[restaurantId] ?? [];
  const activePromotions = (await getPromotions(restaurantId)).filter((p) => p.status === "active").length;
  return metrics.map((m) => (m.id === "promos" ? { ...m, value: activePromotions } : m));
}

export async function getRecentActivity(restaurantId: string): Promise<Activity[]> {
  return mockActivity[restaurantId] ?? [];
}

// ---------------------------------------------------------------------------
// Loyalty program & card

export async function getLoyaltyProgram(restaurantId: string): Promise<LoyaltyProgram | null> {
  const [row] = await (await db()).select().from(loyaltyPrograms).where(eq(loyaltyPrograms.restaurantId, restaurantId));
  return row ? toProgram(row) : null;
}

export async function getLoyaltyCardPreview(restaurantId: string): Promise<LoyaltyCardPreviewData | null> {
  const database = await db();
  const [[card], program] = await Promise.all([
    database.select().from(loyaltyCards).where(eq(loyaltyCards.restaurantId, restaurantId)),
    getLoyaltyProgram(restaurantId),
  ]);
  const sample = mockPreviewSamples[restaurantId];
  if (!card || !program || !sample) return null;
  const { displayName, tagline, brandColor, accentColor, logoUrl } = card;
  return { card: { id: card.id, restaurantId, design: { displayName, tagline, brandColor, accentColor, logoUrl }, program }, sample };
}

// ---------------------------------------------------------------------------
// Customers, stamps and rewards

export async function getRestaurantCustomers(restaurantId: string): Promise<Customer[]> {
  const [rows, today] = await Promise.all([
    (await db()).select().from(customers).where(eq(customers.restaurantId, restaurantId)).orderBy(asc(customers.memberId)),
    getToday(),
  ]);
  return rows.map((row) => toCustomer(row, today));
}

/**
 * Adds one stamp. A single conditional UPDATE, so the card can never go past the
 * reward threshold, even with double clicks. Returns null if the customer is not
 * this restaurant's or the card is already full.
 */
export async function awardStamp(restaurantId: string, customerId: string): Promise<Customer | null> {
  const program = await getLoyaltyProgram(restaurantId);
  if (!program) return null;
  const [row] = await (await db())
    .update(customers)
    .set({ stamps: sql`${customers.stamps} + 1`, lastVisitAt: new Date() })
    .where(and(eq(customers.id, customerId), eq(customers.restaurantId, restaurantId), lt(customers.stamps, program.stampsRequired)))
    .returning();
  return row ? toCustomer(row, await getToday()) : null;
}

/** Resets a full card and records the redemption, both or neither (one transaction). */
export async function redeemReward(restaurantId: string, customerId: string): Promise<Customer | null> {
  const program = await getLoyaltyProgram(restaurantId);
  if (!program) return null;
  const row = await (await db()).transaction(async (tx) => {
    const [updated] = await tx
      .update(customers)
      .set({ stamps: 0, lastVisitAt: new Date() })
      .where(and(eq(customers.id, customerId), eq(customers.restaurantId, restaurantId), gte(customers.stamps, program.stampsRequired)))
      .returning();
    if (!updated) return null;
    await tx.insert(redemptions).values({
      id: randomUUID(),
      restaurantId,
      customerId,
      customerName: updated.name,
      rewardTitle: program.rewardTitle,
    });
    return updated;
  });
  return row ? toCustomer(row, await getToday()) : null;
}

/** Customers whose card is full and who can claim the reward now. */
export async function getRewardReadyCustomers(restaurantId: string): Promise<Customer[]> {
  const program = await getLoyaltyProgram(restaurantId);
  if (!program) return [];
  const [rows, today] = await Promise.all([
    (await db())
      .select()
      .from(customers)
      .where(and(eq(customers.restaurantId, restaurantId), gte(customers.stamps, program.stampsRequired)))
      .orderBy(asc(customers.name)),
    getToday(),
  ]);
  return rows.map((row) => toCustomer(row, today));
}

/** Reward redemptions for one restaurant, newest first (latest 50). */
export async function getRedemptions(restaurantId: string): Promise<Redemption[]> {
  const [rows, today] = await Promise.all([
    (await db())
      .select()
      .from(redemptions)
      .where(eq(redemptions.restaurantId, restaurantId))
      .orderBy(desc(redemptions.redeemedAt))
      .limit(50),
    getToday(),
  ]);
  return rows.map(({ redeemedAt, ...r }) => ({ ...r, redeemedAt: formatRelativeDay(redeemedAt, today) }));
}

// ---------------------------------------------------------------------------
// Promotions

function promotionStatus(promotion: Promotion, onDate: string): PromotionStatus {
  if (promotion.endedEarly || onDate > promotion.endDate) return "ended";
  if (onDate < promotion.startDate) return "scheduled";
  return "active";
}

const statusOrder: Record<PromotionStatus, number> = { active: 0, scheduled: 1, ended: 2 };

/** A restaurant's promotions: active first, then scheduled, then ended. */
export async function getPromotions(restaurantId: string): Promise<PromotionWithStatus[]> {
  const [rows, today] = await Promise.all([
    (await db()).select().from(promotions).where(eq(promotions.restaurantId, restaurantId)),
    getToday(),
  ]);
  return rows
    .map((p) => ({ ...p, status: promotionStatus(p, today) }))
    .sort((a, b) =>
      statusOrder[a.status] - statusOrder[b.status] ||
      (a.status === "ended" ? b.endDate.localeCompare(a.endDate) : a.startDate.localeCompare(b.startDate)),
    );
}

export interface NewPromotion {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export type PromotionResult =
  | { ok: true; promotions: PromotionWithStatus[] }
  | { ok: false; error: string };

const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

export async function createPromotion(restaurantId: string, input: NewPromotion): Promise<PromotionResult> {
  if (!(await getRestaurant(restaurantId))) return { ok: false, error: "Restaurant not found." };

  const title = input.title.trim();
  const description = input.description.trim();
  if (!title) return { ok: false, error: "Give the promotion a title." };
  if (title.length > 60) return { ok: false, error: "The title must be 60 characters or fewer." };
  if (description.length > 200) return { ok: false, error: "The description must be 200 characters or fewer." };
  if (!isDate(input.startDate) || !isDate(input.endDate)) return { ok: false, error: "Choose a start and an end date." };
  if (input.endDate < input.startDate) return { ok: false, error: "The end date must be on or after the start date." };
  if (input.endDate < (await getToday())) return { ok: false, error: "The end date cannot be in the past." };

  await (await db()).insert(promotions).values({
    id: randomUUID(),
    restaurantId,
    title,
    description,
    startDate: input.startDate,
    endDate: input.endDate,
  });
  return { ok: true, promotions: await getPromotions(restaurantId) };
}

/** Stops an active promotion, or cancels a scheduled one. */
export async function endPromotion(restaurantId: string, promotionId: string): Promise<PromotionResult> {
  const current = (await getPromotions(restaurantId)).find((p) => p.id === promotionId);
  if (!current) return { ok: false, error: "Promotion not found." };
  if (current.status === "ended") return { ok: false, error: "This promotion has already ended." };

  await (await db())
    .update(promotions)
    .set({ endedEarly: true })
    .where(and(eq(promotions.id, promotionId), eq(promotions.restaurantId, restaurantId)));
  return { ok: true, promotions: await getPromotions(restaurantId) };
}

// ---------------------------------------------------------------------------
// Analytics (demo series until real stamp events exist)

/** Weeks of history kept for analytics: enough to compare a 12-week period with the one before it. */
const ANALYTICS_WEEKS = 24;

/** Weekly program activity for one restaurant, over the last completed weeks. */
export async function getAnalytics(restaurantId: string): Promise<RestaurantAnalytics> {
  const date = await getToday();
  const daysSinceMonday = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
  const currentMonday = addDays(date, -daysSinceMonday);
  return {
    weeks: mockAnalyticsWeeks(restaurantId, currentMonday, ANALYTICS_WEEKS),
    weekdayShare: mockWeekdayShare(restaurantId),
  };
}

// ---------------------------------------------------------------------------
// Settings

export async function getRestaurantSettings(restaurantId: string): Promise<RestaurantSettings | null> {
  const database = await db();
  const [[profile], [program]] = await Promise.all([
    database.select().from(restaurantProfiles).where(eq(restaurantProfiles.restaurantId, restaurantId)),
    database.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.restaurantId, restaurantId)),
  ]);
  if (!profile || !program) return null;
  return {
    profile,
    program: toProgram(program),
    editableProgramFields: EDITABLE_FIELDS.filter((f) => program.editableFields.includes(f)),
  };
}

export type SettingsResult<T> = { ok: true; value: T } | { ok: false; error: string };

export async function updateRestaurantProfile(
  restaurantId: string,
  input: Omit<RestaurantProfile, "restaurantId">,
): Promise<SettingsResult<RestaurantProfile>> {
  const profile = {
    contactEmail: input.contactEmail.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    website: input.website.trim(),
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.contactEmail) || profile.contactEmail.length > 100) {
    return { ok: false, error: "Enter a valid contact email." };
  }
  if (profile.phone && !/^[0-9+()\-. ]{7,25}$/.test(profile.phone)) {
    return { ok: false, error: "Enter a valid phone number." };
  }
  if (profile.address.length > 120) return { ok: false, error: "The address must be 120 characters or fewer." };
  if (profile.website && (!/^https?:\/\/\S+\.\S+$/.test(profile.website) || profile.website.length > 100)) {
    return { ok: false, error: "The website must start with http:// or https://." };
  }

  const [row] = await (await db())
    .update(restaurantProfiles)
    .set(profile)
    .where(eq(restaurantProfiles.restaurantId, restaurantId))
    .returning();
  return row ? { ok: true, value: row } : { ok: false, error: "Restaurant not found." };
}

/**
 * Updates the loyalty program fields this restaurant is allowed to edit.
 * Any other field is refused: permissions are enforced here, not only in the UI.
 */
export async function updateLoyaltySettings(
  restaurantId: string,
  changes: Partial<Pick<LoyaltyProgram, EditableProgramField>>,
): Promise<SettingsResult<LoyaltyProgram>> {
  const database = await db();
  const [program] = await database.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.restaurantId, restaurantId));
  if (!program) return { ok: false, error: "Restaurant not found." };

  const fields = Object.keys(changes) as EditableProgramField[];
  if (fields.some((field) => !program.editableFields.includes(field))) {
    return { ok: false, error: "This setting is managed by Fidelity Wallet. Contact us to change it." };
  }

  const update: Partial<Pick<LoyaltyProgram, EditableProgramField>> = {};
  if (changes.rewardDescription !== undefined) {
    const description = changes.rewardDescription.trim();
    if (!description || description.length > 120) {
      return { ok: false, error: "The reward description must be between 1 and 120 characters." };
    }
    update.rewardDescription = description;
  }
  if (changes.expiresInDays !== undefined) {
    const days = changes.expiresInDays;
    if (!Number.isInteger(days) || days < 30 || days > 730) {
      return { ok: false, error: "Reward validity must be between 30 and 730 days." };
    }
    update.expiresInDays = days;
  }
  if (Object.keys(update).length === 0) return { ok: true, value: toProgram(program) };

  const [row] = await database
    .update(loyaltyPrograms)
    .set(update)
    .where(eq(loyaltyPrograms.restaurantId, restaurantId))
    .returning();
  return { ok: true, value: toProgram(row) };
}

// ---------------------------------------------------------------------------
/**
 * Provider-side (Fidelity Wallet admin) reads across all restaurants.
 * Never call these from the restaurant dashboard.
 */
export async function listRestaurantSummaries(): Promise<RestaurantSummary[]> {
  const database = await db();
  const [restaurantRows, programRows, counts] = await Promise.all([
    listRestaurants(),
    database.select().from(loyaltyPrograms),
    database.select({ restaurantId: customers.restaurantId, value: count() }).from(customers).groupBy(customers.restaurantId),
  ]);
  return restaurantRows.map((restaurant) => {
    const program = programRows.find((p) => p.restaurantId === restaurant.id);
    return {
      restaurant,
      program: program ? toProgram(program) : null,
      customerCount: counts.find((c) => c.restaurantId === restaurant.id)?.value ?? 0,
    };
  });
}
