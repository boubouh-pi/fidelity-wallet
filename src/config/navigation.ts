import {
  BarChart3, CreditCard, Gift, LayoutDashboard, Megaphone, Settings, Store, Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  /** Restaurant items: relative to /r/[restaurantId]. Admin items: absolute. */
  path: string;
  icon: LucideIcon;
}

/** Restaurant dashboard navigation. */
export const navigation: NavItem[] = [
  { label: "Dashboard", path: "", icon: LayoutDashboard },
  { label: "Loyalty Card", path: "/loyalty-card", icon: CreditCard },
  { label: "Customers", path: "/customers", icon: Users },
  { label: "Rewards", path: "/rewards", icon: Gift },
  { label: "Promotions", path: "/promotions", icon: Megaphone },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Settings", path: "/settings", icon: Settings },
];

export const restaurantBasePath = (restaurantId: string) => `/r/${restaurantId}`;

/** Fidelity Wallet admin (provider side). Kept separate from restaurant navigation. */
export const adminNavigation: NavItem[] = [
  { label: "Restaurants", path: "/admin/restaurants", icon: Store },
];
