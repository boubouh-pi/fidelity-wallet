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
