"use server";

/**
 * Customer actions for the restaurant dashboard. Thin wrappers: the rules
 * live in the service layer. Real authorization (is the caller allowed to act
 * for this restaurant?) must be added here once authentication exists.
 */
import * as services from "@/services";

export async function awardStamp(restaurantId: string, customerId: string) {
  return services.awardStamp(restaurantId, customerId);
}

export async function redeemReward(restaurantId: string, customerId: string) {
  return services.redeemReward(restaurantId, customerId);
}
