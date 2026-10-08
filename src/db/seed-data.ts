/**
 * DEMO DATA ONLY: the fictional restaurants loaded into the database by `npm run db:seed`.
 * Nothing in the app may depend on a specific one of them. Dates are relative to the
 * day the seed runs, so a fresh seed always shows recent activity.
 */
import type { EditableProgramField, LoyaltyCard, Restaurant, RestaurantProfile } from "@/types";

interface RestaurantSeed {
  restaurant: Restaurant;
  design: LoyaltyCard["design"];
  program: Omit<LoyaltyCard["program"], "id" | "restaurantId">;
  /** Program fields Fidelity Wallet lets this restaurant edit. */
  editableFields: EditableProgramField[];
  profile: Omit<RestaurantProfile, "restaurantId">;
  customers: { id: string; name: string; memberId: string; stamps: number; lastVisitDaysAgo: number }[];
  redemptions: { customerId: string; daysAgo: number }[];
  promotions: { title: string; description: string; startInDays: number; endInDays: number }[];
}

export const seedRestaurants: RestaurantSeed[] = [
  {
    restaurant: { id: "chez-marcel", name: "Chez Marcel", category: "Bistro & Café", city: "Ottawa", status: "active" },
    design: { displayName: "Chez Marcel", tagline: "Bistro & Café", brandColor: "#1f3a2e", accentColor: "#e9b44c", logoUrl: null },
    program: { stampsRequired: 10, rewardTitle: "Free dessert", rewardDescription: "Any dessert from our menu after 10 visits.", expiresInDays: 365 },
    editableFields: ["rewardDescription", "expiresInDays"],
    profile: {
      contactEmail: "contact@chezmarcel.example", phone: "(613) 555-0142",
      address: "12 Murray Street, Ottawa, ON", website: "https://chezmarcel.example",
    },
    customers: [
      { id: "cm-1", name: "Sofia Martin", memberId: "FW-0042-8817", stamps: 6, lastVisitDaysAgo: 0 },
      { id: "cm-2", name: "Lucas Bernard", memberId: "FW-0042-8818", stamps: 10, lastVisitDaysAgo: 0 },
      { id: "cm-3", name: "Amina Khan", memberId: "FW-0042-8819", stamps: 3, lastVisitDaysAgo: 1 },
      { id: "cm-4", name: "Tom Robinson", memberId: "FW-0042-8820", stamps: 0, lastVisitDaysAgo: 0 },
      { id: "cm-5", name: "Chloe Dubois", memberId: "FW-0042-8821", stamps: 9, lastVisitDaysAgo: 2 },
    ],
    redemptions: [
      { customerId: "cm-5", daysAgo: 7 },
      { customerId: "cm-1", daysAgo: 14 },
      { customerId: "cm-3", daysAgo: 30 },
    ],
    promotions: [
      { title: "Double stamps on Tuesdays", description: "Earn 2 stamps per visit every Tuesday.", startInDays: -6, endInDays: 24 },
      { title: "Holiday dessert week", description: "A free mini dessert with any main course.", startInDays: 20, endInDays: 27 },
      { title: "Summer terrace bonus", description: "A bonus stamp for meals on the terrace.", startInDays: -90, endInDays: -30 },
    ],
  },
  {
    restaurant: { id: "cafe-roma", name: "Café Roma", category: "Italian Café", city: "Gatineau", status: "active" },
    design: { displayName: "Café Roma", tagline: "Italian Café", brandColor: "#7a2e1d", accentColor: "#f4d9a8", logoUrl: null },
    program: { stampsRequired: 8, rewardTitle: "Free espresso", rewardDescription: "One espresso of your choice after 8 visits.", expiresInDays: 180 },
    editableFields: ["rewardDescription"],
    profile: { contactEmail: "ciao@caferoma.example", phone: "(819) 555-0178", address: "85 Rue Principale, Gatineau, QC", website: "" },
    customers: [
      { id: "cr-1", name: "Giulia Pellegrini", memberId: "FW-0107-2401", stamps: 7, lastVisitDaysAgo: 0 },
      { id: "cr-2", name: "Marco De Luca", memberId: "FW-0107-2402", stamps: 8, lastVisitDaysAgo: 0 },
      { id: "cr-3", name: "Elena Santini", memberId: "FW-0107-2403", stamps: 4, lastVisitDaysAgo: 1 },
    ],
    redemptions: [{ customerId: "cr-1", daysAgo: 7 }],
    promotions: [
      { title: "Espresso happy hour", description: "A bonus stamp on any espresso between 3 and 5 pm.", startInDays: -3, endInDays: 11 },
      { title: "Back to school", description: "Double stamps for students with a valid card.", startInDays: -40, endInDays: -10 },
    ],
  },
  {
    restaurant: { id: "burger-house", name: "Burger House", category: "Burgers", city: "Montréal", status: "onboarding" },
    design: { displayName: "Burger House", tagline: "Burgers", brandColor: "#222222", accentColor: "#ff6b35", logoUrl: null },
    program: { stampsRequired: 6, rewardTitle: "Free fries", rewardDescription: "A side of fries after 6 visits.", expiresInDays: 365 },
    editableFields: [],
    profile: { contactEmail: "hello@burgerhouse.example", phone: "", address: "", website: "" },
    customers: [],
    redemptions: [],
    promotions: [],
  },
];
