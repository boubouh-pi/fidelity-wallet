/**
 * Data access layer. Every call is scoped to a restaurant. Components never
 * import mock data directly. To connect a real backend, replace the bodies
 * here with fetch() calls; signatures and return types stay the same.
 */
import { mockActivity, mockCards, mockCustomers, mockMetrics, mockRestaurants } from "@/data/mock";
import type { Activity, Customer, DashboardMetric, LoyaltyCardPreviewData, Restaurant } from "@/types";

export async function listRestaurants(): Promise<Restaurant[]> {
  return mockRestaurants;
}

export async function getRestaurant(restaurantId: string): Promise<Restaurant | null> {
  return mockRestaurants.find((r) => r.id === restaurantId) ?? null;
}

export async function getDashboardMetrics(restaurantId: string): Promise<DashboardMetric[]> {
  return mockMetrics[restaurantId] ?? [];
}

export async function getRecentActivity(restaurantId: string): Promise<Activity[]> {
  return mockActivity[restaurantId] ?? [];
}

export async function getRestaurantCustomers(restaurantId: string): Promise<Customer[]> {
  return mockCustomers[restaurantId] ?? [];
}

export async function getLoyaltyCardPreview(restaurantId: string): Promise<LoyaltyCardPreviewData | null> {
  const card = mockCards[restaurantId];
  if (!card) return null;
  return { card, sample: { customerName: "Sofia Martin", stamps: Math.ceil(card.program.stampsRequired * 0.6), memberId: "FW-0042-8817" } };
}
