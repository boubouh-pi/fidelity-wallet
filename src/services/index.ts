/**
 * Data access layer. Restaurant data is always read through a restaurantId;
 * provider-wide reads are grouped at the end. Components never
 * import mock data directly. To connect a real backend, replace the bodies
 * here with fetch() calls; signatures and return types stay the same.
 */
import { mockActivity, mockCards, mockCustomers, mockMetrics, mockPreviewSamples, mockRestaurants } from "@/data/mock";
import type { Activity, Customer, DashboardMetric, LoyaltyCardPreviewData, LoyaltyProgram, Restaurant, RestaurantSummary } from "@/types";

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
  return updateCustomer(restaurantId, customerId, (customer, program) =>
    customer.stamps < program.stampsRequired
      ? null
      : { ...customer, stamps: 0, lastVisit: "Just now" },
  );
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
