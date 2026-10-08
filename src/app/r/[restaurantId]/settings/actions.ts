"use server";

/**
 * Settings actions for the restaurant dashboard. Thin wrappers: the rules and
 * the program-permission check live in the service layer. Real authorization
 * (is the caller allowed to act for this restaurant?) must be added here once
 * authentication exists.
 */
import * as services from "@/services";
import type { EditableProgramField, RestaurantProfile } from "@/types";

export async function updateProfile(restaurantId: string, input: Omit<RestaurantProfile, "restaurantId">) {
  // Server actions can be called with any payload: keep only the expected string fields.
  return services.updateRestaurantProfile(String(restaurantId), {
    contactEmail: String(input?.contactEmail ?? ""),
    phone: String(input?.phone ?? ""),
    address: String(input?.address ?? ""),
    website: String(input?.website ?? ""),
  });
}

export async function updateLoyaltySettings(
  restaurantId: string,
  input: Partial<{ rewardDescription: string; expiresInDays: number }>,
) {
  const changes: Partial<{ rewardDescription: string; expiresInDays: number }> = {};
  const fields: EditableProgramField[] = ["rewardDescription", "expiresInDays"];
  for (const field of fields) {
    if (input?.[field] === undefined) continue;
    if (field === "expiresInDays") changes.expiresInDays = Number(input.expiresInDays);
    else changes.rewardDescription = String(input.rewardDescription);
  }
  return services.updateLoyaltySettings(String(restaurantId), changes);
}
