"use server";

/**
 * Promotion actions for the restaurant dashboard. Thin wrappers: the rules
 * live in the service layer. Real authorization (is the caller allowed to act
 * for this restaurant?) must be added here once authentication exists.
 */
import * as services from "@/services";
import type { NewPromotion } from "@/services";

export async function createPromotion(restaurantId: string, input: NewPromotion) {
  // Server actions can be called with any payload: keep only the expected string fields.
  return services.createPromotion(String(restaurantId), {
    title: String(input?.title ?? ""),
    description: String(input?.description ?? ""),
    startDate: String(input?.startDate ?? ""),
    endDate: String(input?.endDate ?? ""),
  });
}

export async function endPromotion(restaurantId: string, promotionId: string) {
  return services.endPromotion(String(restaurantId), String(promotionId));
}
