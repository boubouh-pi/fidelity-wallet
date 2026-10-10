/**
 * Accounts: sign-in, sign-out, password changes, and account management by
 * Fidelity Wallet staff. There is no public sign-up: only admins create accounts.
 */
import { randomUUID } from "node:crypto";
import { and, asc, count, eq, gt } from "drizzle-orm";
import { getCurrentUser, requireAdmin, requireUser } from "@/auth/dal";
import { generatePassword, hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/auth/password";
import { createSession, deleteOtherSessions, deleteSession, type SessionUser } from "@/auth/session";
import { getDb, schema } from "@/db";

const { loginAttempts, restaurants, users } = schema;

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// Compared against when the email is unknown, so a wrong email takes as long as a wrong password.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hashPassword("not-a-real-password"));

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 100;

export type AccountResult<T = undefined> = { ok: true; value: T } | { ok: false; error: string };

export async function signIn(emailInput: string, password: string): Promise<AccountResult<SessionUser>> {
  const email = normalizeEmail(emailInput);
  const db = getDb();
  const since = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000);

  const [{ value: failures }] = await db
    .select({ value: count() })
    .from(loginAttempts)
    .where(and(eq(loginAttempts.email, email), gt(loginAttempts.attemptedAt, since)));
  if (failures >= MAX_FAILED_ATTEMPTS) {
    return { ok: false, error: `Too many attempts. Try again in ${LOCKOUT_MINUTES} minutes.` };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid) {
    await db.insert(loginAttempts).values({ id: randomUUID(), email });
    return { ok: false, error: "Incorrect email or password." };
  }

  await db.delete(loginAttempts).where(eq(loginAttempts.email, email));
  await createSession(user.id);
  const { id, name, role, restaurantId } = user;
  return { ok: true, value: { id, email: user.email, name, role, restaurantId } };
}

export async function signOut() {
  await deleteSession();
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<AccountResult> {
  const me = await requireUser();
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `The new password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  const [user] = await getDb().select().from(users).where(eq(users.id, me.id));
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    return { ok: false, error: "Your current password is incorrect." };
  }
  await getDb().update(users).set({ passwordHash: await hashPassword(newPassword) }).where(eq(users.id, me.id));
  await deleteOtherSessions(me.id);
  return { ok: true, value: undefined };
}

// ---------------------------------------------------------------------------
// Account management (Fidelity Wallet admins only)

export interface AccountSummary {
  id: string;
  name: string;
  email: string;
  role: "admin" | "restaurant";
  restaurantId: string | null;
  restaurantName: string | null;
  createdAt: string;
}

export async function listAccounts(): Promise<AccountSummary[]> {
  await requireAdmin();
  const rows = await getDb()
    .select({
      id: users.id, name: users.name, email: users.email, role: users.role,
      restaurantId: users.restaurantId, restaurantName: restaurants.name, createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(restaurants, eq(restaurants.id, users.restaurantId))
    .orderBy(asc(users.role), asc(restaurants.name), asc(users.name));
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString().slice(0, 10) }));
}

export interface NewAccount {
  name: string;
  email: string;
  role: "admin" | "restaurant";
  restaurantId: string | null;
}

/** Creates an account with a random temporary password, returned once so the admin can pass it on. */
export async function createAccount(input: NewAccount): Promise<AccountResult<{ email: string; temporaryPassword: string }>> {
  await requireAdmin();
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  if (!name || name.length > 80) return { ok: false, error: "Enter a name (80 characters max)." };
  if (!isEmail(email)) return { ok: false, error: "Enter a valid email." };
  if (input.role !== "admin" && input.role !== "restaurant") return { ok: false, error: "Choose an account type." };

  const restaurantId = input.role === "restaurant" ? input.restaurantId : null;
  if (input.role === "restaurant") {
    const [restaurant] = restaurantId
      ? await getDb().select({ id: restaurants.id }).from(restaurants).where(eq(restaurants.id, restaurantId))
      : [];
    if (!restaurant) return { ok: false, error: "Choose the restaurant this account belongs to." };
  }

  const [existing] = await getDb().select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) return { ok: false, error: "An account with this email already exists." };

  const temporaryPassword = generatePassword();
  await getDb().insert(users).values({
    id: randomUUID(), name, email, role: input.role, restaurantId, passwordHash: await hashPassword(temporaryPassword),
  });
  return { ok: true, value: { email, temporaryPassword } };
}

/** Removes an account and signs it out everywhere. Admins cannot remove themselves. */
export async function deleteAccount(userId: string): Promise<AccountResult> {
  const me = await requireAdmin();
  if (userId === me.id) return { ok: false, error: "You cannot remove your own account." };
  const deleted = await getDb().delete(users).where(eq(users.id, userId)).returning({ id: users.id });
  return deleted.length ? { ok: true, value: undefined } : { ok: false, error: "Account not found." };
}

export { getCurrentUser };
