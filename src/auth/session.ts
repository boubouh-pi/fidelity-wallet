/**
 * Database sessions. The browser holds a random token in an httpOnly cookie; the
 * database only stores its SHA-256, so neither side alone can forge a session.
 * Server-only: never import from a Client Component.
 */
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, ne, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getDb, schema } from "@/db";
import { SESSION_COOKIE } from "./constants";

const SESSION_DAYS = 7;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "restaurant";
  restaurantId: string | null;
}

/** Starts a session for this user and sets the cookie. Call from a Server Action only. */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await getDb().insert(schema.sessions).values({ id: hashToken(token), userId, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** The signed-in user, or null. Reads the cookie, so it runs at request time. */
export async function readSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  // Wait for a real request before touching the database: a prerender must never open a
  // connection (it would be aborted half-way and leave a broken socket in the pool).
  await connection();
  const { sessions, users } = schema;
  const [row] = await getDb()
    .select({ id: users.id, email: users.email, name: users.name, role: users.role, restaurantId: users.restaurantId })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    // Expiry is compared with the database clock, not the server's.
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, sql`now()`)));
  return row ?? null;
}

/** Ends the current session and clears the cookie. Call from a Server Action only. */
export async function deleteSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await getDb().delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token)));
  store.delete(SESSION_COOKIE);
}

/** Signs a user out everywhere except the current browser (e.g. after a password change). */
export async function deleteOtherSessions(userId: string) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const { sessions } = schema;
  await getDb()
    .delete(sessions)
    .where(and(eq(sessions.userId, userId), token ? ne(sessions.id, hashToken(token)) : undefined));
}
