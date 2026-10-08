/** A business that is a client of Fidelity Wallet. Identity only, no card design. */
export interface Restaurant {
  id: string;
  name: string;
  category: string;
  city: string;
  status: "active" | "onboarding" | "paused";
}

/**
 * Visual design of a restaurant's loyalty card.
 * Configured by Fidelity Wallet; restaurants cannot edit it (yet).
 */
export interface CardDesign {
  displayName: string;
  tagline: string;
  brandColor: string;
  accentColor: string;
  logoUrl: string | null;
}

/** Rules of a restaurant's loyalty program. */
export interface LoyaltyProgram {
  id: string;
  restaurantId: string;
  stampsRequired: number;
  rewardTitle: string;
  rewardDescription: string;
  expiresInDays: number;
}

export interface LoyaltyCard {
  id: string;
  restaurantId: string;
  design: CardDesign;
  program: LoyaltyProgram;
}

/** A card plus a sample customer, used only to render a preview. */
export interface LoyaltyCardPreviewData {
  card: LoyaltyCard;
  sample: { customerName: string; stamps: number; memberId: string };
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  /** Percent change vs. previous period. */
  change: number;
  hint: string;
}

export interface Activity {
  id: string;
  customer: string;
  action: string;
  time: string;
}

/** An end customer enrolled in one restaurant's loyalty program. */
export interface Customer {
  id: string;
  restaurantId: string;
  name: string;
  memberId: string;
  stamps: number;
  lastVisit: string;
}

/** Provider-side overview of one restaurant client, for the Fidelity Wallet admin. */
export interface RestaurantSummary {
  restaurant: Restaurant;
  program: LoyaltyProgram | null;
  customerCount: number;
}

/** A reward claimed by one of a restaurant's customers. */
export interface Redemption {
  id: string;
  restaurantId: string;
  customerId: string;
  customerName: string;
  /** Reward title at the time of redemption. */
  rewardTitle: string;
  redeemedAt: string;
}

export type PromotionStatus = "scheduled" | "active" | "ended";

/** A limited-time offer a restaurant runs for its loyalty members. Dates are YYYY-MM-DD. */
export interface Promotion {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  /** Stopped by the restaurant before its end date. */
  endedEarly: boolean;
}

export type PromotionWithStatus = Promotion & { status: PromotionStatus };

/** One completed week (Monday to Sunday) of program activity. */
export interface AnalyticsWeek {
  /** Monday of the week, YYYY-MM-DD. */
  weekStart: string;
  /** Stamps awarded, i.e. visits by loyalty members. */
  visits: number;
  redemptions: number;
  newMembers: number;
}

export interface RestaurantAnalytics {
  /** Completed weeks, oldest first. Empty while the program has no activity. */
  weeks: AnalyticsWeek[];
  /** Share of visits per weekday, Monday first (sums to 1). */
  weekdayShare: number[];
}

/** Contact details a restaurant manages itself. Empty string = not provided. */
export interface RestaurantProfile {
  restaurantId: string;
  contactEmail: string;
  phone: string;
  address: string;
  website: string;
}

/** Loyalty program fields Fidelity Wallet may allow a restaurant to edit. */
export type EditableProgramField = "rewardDescription" | "expiresInDays";

export interface RestaurantSettings {
  profile: RestaurantProfile;
  program: LoyaltyProgram;
  /** Fields this restaurant may change; everything else is managed by Fidelity Wallet. */
  editableProgramFields: EditableProgramField[];
}
