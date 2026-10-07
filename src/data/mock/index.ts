/**
 * DEMO DATA ONLY. These restaurants are fictional examples used to
 * demonstrate the multi-restaurant structure. Nothing in the app may
 * depend on a specific one of them.
 */
import type { Activity, Customer, DashboardMetric, LoyaltyCard, LoyaltyCardPreviewData, Restaurant } from "@/types";

export const mockRestaurants: Restaurant[] = [
  { id: "chez-marcel", name: "Chez Marcel", category: "Bistro & Café", city: "Ottawa", status: "active" },
  { id: "cafe-roma", name: "Café Roma", category: "Italian Café", city: "Gatineau", status: "active" },
  { id: "burger-house", name: "Burger House", category: "Burgers", city: "Montréal", status: "onboarding" },
];

const metrics = (customers: number, cards: number, redeemed: number, promos: number): DashboardMetric[] => [
  { id: "customers", label: "Active customers", value: customers, change: 8.2, hint: "Last 30 days" },
  { id: "cards", label: "Loyalty cards", value: cards, change: 5.4, hint: "Added to a wallet" },
  { id: "redeemed", label: "Rewards redeemed", value: redeemed, change: 12.1, hint: "This month" },
  { id: "promos", label: "Active promotions", value: promos, change: 0, hint: "Currently running" },
];

export const mockMetrics: Record<string, DashboardMetric[]> = {
  "chez-marcel": metrics(1284, 1462, 213, 3),
  "cafe-roma": metrics(642, 701, 96, 1),
  "burger-house": metrics(0, 0, 0, 0),
};

const activity = (names: string[]): Activity[] => [
  { id: "1", customer: names[0], action: "Earned a stamp", time: "2 min ago" },
  { id: "2", customer: names[1], action: "Redeemed a reward", time: "18 min ago" },
  { id: "3", customer: names[2], action: "Added card to Apple Wallet", time: "1 h ago" },
  { id: "4", customer: names[3], action: "Added card to Google Wallet", time: "3 h ago" },
];

export const mockActivity: Record<string, Activity[]> = {
  "chez-marcel": activity(["Sofia M.", "Lucas B.", "Amina K.", "Tom R."]),
  "cafe-roma": activity(["Giulia P.", "Marco D.", "Elena S.", "Paul T."]),
  "burger-house": [],
};

const customer = (
  id: string,
  restaurantId: string,
  name: string,
  memberId: string,
  stamps: number,
  lastVisit: string,
): Customer => ({ id, restaurantId, name, memberId, stamps, lastVisit });

/** In-memory store: customer actions update it until the server restarts. */
export const mockCustomers: Record<string, Customer[]> = {
  "chez-marcel": [
    customer("cm-1", "chez-marcel", "Sofia Martin", "FW-0042-8817", 6, "2 min ago"),
    customer("cm-2", "chez-marcel", "Lucas Bernard", "FW-0042-8818", 10, "Today, 11:24 AM"),
    customer("cm-3", "chez-marcel", "Amina Khan", "FW-0042-8819", 3, "Yesterday"),
    customer("cm-4", "chez-marcel", "Tom Robinson", "FW-0042-8820", 0, "Joined today"),
    customer("cm-5", "chez-marcel", "Chloe Dubois", "FW-0042-8821", 9, "Monday"),
  ],
  "cafe-roma": [
    customer("cr-1", "cafe-roma", "Giulia Pellegrini", "FW-0107-2401", 7, "18 min ago"),
    customer("cr-2", "cafe-roma", "Marco De Luca", "FW-0107-2402", 8, "Today, 9:42 AM"),
    customer("cr-3", "cafe-roma", "Elena Santini", "FW-0107-2403", 4, "Yesterday"),
  ],
  "burger-house": [],
};

const card = (
  restaurantId: string,
  design: LoyaltyCard["design"],
  program: Omit<LoyaltyCard["program"], "id" | "restaurantId">,
): LoyaltyCard => ({
  id: `card_${restaurantId}`,
  restaurantId,
  design,
  program: { id: `prog_${restaurantId}`, restaurantId, ...program },
});

export const mockCards: Record<string, LoyaltyCard> = {
  "chez-marcel": card(
    "chez-marcel",
    { displayName: "Chez Marcel", tagline: "Bistro & Café", brandColor: "#1f3a2e", accentColor: "#e9b44c", logoUrl: null },
    { stampsRequired: 10, rewardTitle: "Free dessert", rewardDescription: "Any dessert from our menu after 10 visits.", expiresInDays: 365 },
  ),
  "cafe-roma": card(
    "cafe-roma",
    { displayName: "Café Roma", tagline: "Italian Café", brandColor: "#7a2e1d", accentColor: "#f4d9a8", logoUrl: null },
    { stampsRequired: 8, rewardTitle: "Free espresso", rewardDescription: "One espresso of your choice after 8 visits.", expiresInDays: 180 },
  ),
  "burger-house": card(
    "burger-house",
    { displayName: "Burger House", tagline: "Burgers", brandColor: "#222222", accentColor: "#ff6b35", logoUrl: null },
    { stampsRequired: 6, rewardTitle: "Free fries", rewardDescription: "A side of fries after 6 visits.", expiresInDays: 365 },
  ),
};

/** Sample customer shown on each restaurant's loyalty card preview. */
export const mockPreviewSamples: Record<string, LoyaltyCardPreviewData["sample"]> = {
  "chez-marcel": { customerName: "Sofia Martin", stamps: 6, memberId: "FW-0042-8817" },
  "cafe-roma": { customerName: "Giulia Pellegrini", stamps: 5, memberId: "FW-0107-2401" },
  "burger-house": { customerName: "Sample Customer", stamps: 4, memberId: "FW-0213-0001" },
};
