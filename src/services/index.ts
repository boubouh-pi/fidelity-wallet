/**
 * Data access layer. Restaurant data is always read through a restaurantId;
 * provider-wide reads are grouped at the end. Components never
 * import mock data directly. To connect a real backend, replace the bodies
 * here with fetch() calls; signatures and return types stay the same.
 */
import { connection } from "next/server";
import {
  mockActivity, mockCards, mockCustomers, mockMetrics, mockPreviewSamples, mockPromotions, mockRedemptions, mockRestaurants,
  mockAnalyticsWeeks, mockWeekdayShare, seedMockPromotions,
} from "@/data/mock";
import { addDays } from "@/lib/utils";
import type {
  Activity, Customer, DashboardMetric, LoyaltyCardPreviewData, LoyaltyProgram, Promotion, PromotionStatus,
  PromotionWithStatus, Redemption, Restaurant, RestaurantAnalytics, RestaurantSummary,
} from "@/types";

export async function listRestaurants(): Promise<Restaurant[]> {
  return mockRestaurants;
}

export async function getRestaurant(restaurantId: string): Promise<Restaurant | null> {
  return mockRestaurants.find((r) => r.id === restaurantId) ?? null;
}

export async function getDashboardMetrics(restaurantId: string): Promise<DashboardMetric[]> {
  const metrics = mockMetrics[restaurantId] ?? [];
  const activePromotions = (await getPromotions(restaurantId)).filter((p) => p.status === "active").length;
  return metrics.map((m) => (m.id === "promos" ? { ...m, value: activePromotions } : m));
}

export async function getRecentActivity(restaurantId: string): Promise<Activity[]> {
  return mockActivity[restaurantId] ?? [];
}

export async function getRestaurantCustomers(restaurantId: string): Promise<Customer[]> {
  return mockCustomers[restaurantId] ?? [];
}

export async function getLoyaltyProgram(restaurantId: string): Promise<LoyaltyProgram | null> {
  return mockCards[restaurantId]?.program ?? null;
}

export async function getLoyaltyCardPreview(restaurantId: string): Promise<LoyaltyCardPreviewData | null> {
  const card = mockCards[restaurantId];
  const sample = mockPreviewSamples[restaurantId];
  if (!card || !sample) return null;
  return { card, sample };
}

/**
 * Applies a change to one of the restaurant's customers. Returns the updated
 * customer, or null if the customer does not belong to this restaurant or the
 * change is not allowed.
 */
async function updateCustomer(
  restaurantId: string,
  customerId: string,
  change: (customer: Customer, program: LoyaltyProgram) => Customer | null,
): Promise<Customer | null> {
  const customers = mockCustomers[restaurantId];
  const program = await getLoyaltyProgram(restaurantId);
  const customer = customers?.find((c) => c.id === customerId);
  if (!customers || !program || !customer) return null;

  const updated = change(customer, program);
  if (!updated) return null;
  mockCustomers[restaurantId] = customers.map((c) => (c.id === customerId ? updated : c));
  return updated;
}

export async function awardStamp(restaurantId: string, customerId: string): Promise<Customer | null> {
  return updateCustomer(restaurantId, customerId, (customer, program) =>
    customer.stamps >= program.stampsRequired
      ? null
      : { ...customer, stamps: customer.stamps + 1, lastVisit: "Just now" },
  );
}

export async function redeemReward(restaurantId: string, customerId: string): Promise<Customer | null> {
  const program = await getLoyaltyProgram(restaurantId);
  if (!program) return null;
  const updated = await updateCustomer(restaurantId, customerId, (customer) =>
    customer.stamps < program.stampsRequired
      ? null
      : { ...customer, stamps: 0, lastVisit: "Just now" },
  );
  if (!updated) return null;

  const history = mockRedemptions[restaurantId] ?? [];
  mockRedemptions[restaurantId] = [
    {
      id: `${restaurantId}-rd-${history.length + 1}`,
      restaurantId,
      customerId,
      customerName: updated.name,
      rewardTitle: program.rewardTitle,
      redeemedAt: "Just now",
    },
    ...history,
  ];
  return updated;
}

/** Customers whose card is full and who can claim the reward now. */
export async function getRewardReadyCustomers(restaurantId: string): Promise<Customer[]> {
  const [customers, program] = await Promise.all([
    getRestaurantCustomers(restaurantId),
    getLoyaltyProgram(restaurantId),
  ]);
  if (!program) return [];
  return customers.filter((c) => c.stamps >= program.stampsRequired);
}

/** Reward redemptions for one restaurant, newest first. */
export async function getRedemptions(restaurantId: string): Promise<Redemption[]> {
  return mockRedemptions[restaurantId] ?? [];
}

/** Today's date (YYYY-MM-DD, UTC). Waits for a request so the date is never frozen at build time. */
export async function getToday(): Promise<string> {
  await connection();
  return new Date().toISOString().slice(0, 10);
}

function promotionStatus(promotion: Promotion, onDate: string): PromotionStatus {
  if (promotion.endedEarly || onDate > promotion.endDate) return "ended";
  if (onDate < promotion.startDate) return "scheduled";
  return "active";
}

const statusOrder: Record<PromotionStatus, number> = { active: 0, scheduled: 1, ended: 2 };

/** A restaurant's promotions: active first, then scheduled, then ended. */
export async function getPromotions(restaurantId: string): Promise<PromotionWithStatus[]> {
  const date = await getToday();
  seedMockPromotions(date);
  return (mockPromotions[restaurantId] ?? [])
    .map((p) => ({ ...p, status: promotionStatus(p, date) }))
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

  const promotions = mockPromotions[restaurantId] ?? [];
  mockPromotions[restaurantId] = [
    ...promotions,
    {
      id: `${restaurantId}-promo-${promotions.length + 1}`,
      restaurantId,
      title,
      description,
      startDate: input.startDate,
      endDate: input.endDate,
      endedEarly: false,
    },
  ];
  return { ok: true, promotions: await getPromotions(restaurantId) };
}

/** Stops an active promotion, or cancels a scheduled one. */
export async function endPromotion(restaurantId: string, promotionId: string): Promise<PromotionResult> {
  const current = (await getPromotions(restaurantId)).find((p) => p.id === promotionId);
  if (!current) return { ok: false, error: "Promotion not found." };
  if (current.status === "ended") return { ok: false, error: "This promotion has already ended." };

  mockPromotions[restaurantId] = (mockPromotions[restaurantId] ?? []).map((p) =>
    p.id === promotionId ? { ...p, endedEarly: true } : p,
  );
  return { ok: true, promotions: await getPromotions(restaurantId) };
}

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

/**
 * Provider-side (Fidelity Wallet admin) reads across all restaurants.
 * Never call these from the restaurant dashboard.
 */
export async function listRestaurantSummaries(): Promise<RestaurantSummary[]> {
  const restaurants = await listRestaurants();
  return Promise.all(
    restaurants.map(async (restaurant) => ({
      restaurant,
      program: await getLoyaltyProgram(restaurant.id),
      customerCount: (await getRestaurantCustomers(restaurant.id)).length,
    })),
  );
}
