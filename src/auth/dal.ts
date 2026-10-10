/**
 * Data Access Layer for authorization. Every service function that touches a
 * restaurant's data calls one of these first, so access is enforced on the
 * server for pages and Server Actions alike, never only in the UI.
 */
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { restaurantBasePath } from "@/config/navigation";
import { readSessionUser, type SessionUser } from "./session";

/** The signed-in user (read once per request), or null. */
export const getCurrentUser = cache(readSessionUser);

/** The signed-in user; sends visitors to the login page. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Fidelity Wallet staff only. Others get a 404, so the admin area's existence is not confirmed. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") notFound();
  return user;
}

export function canAccessRestaurant(user: SessionUser, restaurantId: string) {
  return user.role === "admin" || user.restaurantId === restaurantId;
}

/** Admins can open any restaurant; a restaurant user only their own. Others get a 404. */
export async function requireRestaurantAccess(restaurantId: string): Promise<SessionUser> {
  const user = await requireUser();
  if (!canAccessRestaurant(user, restaurantId)) notFound();
  return user;
}

/** Where a user lands after signing in. */
export function homePath(user: SessionUser) {
  return user.role === "admin" || !user.restaurantId ? "/admin/restaurants" : restaurantBasePath(user.restaurantId);
}
