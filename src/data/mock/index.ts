/**
 * DEMO DATA ONLY, generated at display time: dashboard figures, recent activity,
 * the card-preview sample and analytics. There is no real source for these yet;
 * they will be computed from real stamps and wallet events once those exist.
 * Everything a restaurant creates or edits lives in the database (see src/db).
 */
import type { Activity, AnalyticsWeek, DashboardMetric, LoyaltyCardPreviewData } from "@/types";
import { addDays } from "@/lib/utils";

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

/** Sample customer shown on each restaurant's loyalty card preview. */
export const mockPreviewSamples: Record<string, LoyaltyCardPreviewData["sample"]> = {
  "chez-marcel": { customerName: "Sofia Martin", stamps: 6, memberId: "FW-0042-8817" },
  "cafe-roma": { customerName: "Giulia Pellegrini", stamps: 5, memberId: "FW-0107-2401" },
  "burger-house": { customerName: "Sample Customer", stamps: 4, memberId: "FW-0213-0001" },
};

interface AnalyticsProfile {
  /** Visits in the oldest week, and weekly growth rate. */
  baseVisits: number;
  growth: number;
  /** Share of visits that end with a reward being redeemed. */
  redemptionRate: number;
  baseNewMembers: number;
  weekdayShare: number[];
}

/** Restaurants without a profile (still onboarding) have no analytics yet. */
const analyticsProfiles: Record<string, AnalyticsProfile> = {
  "chez-marcel": {
    baseVisits: 610, growth: 0.012, redemptionRate: 0.075, baseNewMembers: 38,
    weekdayShare: [0.1, 0.12, 0.13, 0.14, 0.19, 0.2, 0.12],
  },
  "cafe-roma": {
    baseVisits: 300, growth: 0.018, redemptionRate: 0.08, baseNewMembers: 21,
    weekdayShare: [0.16, 0.15, 0.15, 0.15, 0.15, 0.13, 0.11],
  },
};

/** Deterministic pseudo-random value in [-1, 1], so the demo charts never change between renders. */
const noise = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

/** Demo weekly activity for the `count` completed weeks before `currentMonday`, oldest first. */
export function mockAnalyticsWeeks(restaurantId: string, currentMonday: string, count: number): AnalyticsWeek[] {
  const profile = analyticsProfiles[restaurantId];
  if (!profile) return [];
  const seedBase = [...restaurantId].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return Array.from({ length: count }, (_, i) => {
    const trend = profile.baseVisits * (1 + profile.growth) ** i;
    const visits = Math.round(trend * (1 + 0.08 * noise(seedBase + i)));
    return {
      weekStart: addDays(currentMonday, -7 * (count - i)),
      visits,
      redemptions: Math.round(visits * profile.redemptionRate * (1 + 0.15 * noise(seedBase + i + 100))),
      newMembers: Math.max(0, Math.round(profile.baseNewMembers * (1 + 0.3 * noise(seedBase + i + 200)) + i * 0.4)),
    };
  });
}

export function mockWeekdayShare(restaurantId: string): number[] {
  return analyticsProfiles[restaurantId]?.weekdayShare ?? [0, 0, 0, 0, 0, 0, 0];
}
