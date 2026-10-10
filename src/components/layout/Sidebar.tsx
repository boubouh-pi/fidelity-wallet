"use client";

import { navigation, restaurantBasePath } from "@/config/navigation";
import { initials } from "@/lib/utils";
import type { Restaurant } from "@/types";
import { RestaurantSwitcher, type RestaurantOption } from "./RestaurantSwitcher";
import { DemoNotice, SidebarBrand, SidebarNav } from "./SidebarParts";

/**
 * Restaurant dashboard sidebar. `restaurants` is set only for Fidelity Wallet admins,
 * who get the switcher; a restaurant's own team just sees its name.
 */
export function Sidebar({ restaurant, restaurants }: { restaurant: Restaurant; restaurants: RestaurantOption[] | null }) {
  const base = restaurantBasePath(restaurant.id);
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <SidebarBrand href={base} workspace="Restaurant dashboard" />

      {restaurants ? (
        <RestaurantSwitcher current={restaurant} restaurants={restaurants} />
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-50 text-xs font-semibold text-brand-700">
            {initials(restaurant.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-900">{restaurant.name}</span>
            <span className="block truncate text-xs text-slate-500">{restaurant.city}</span>
          </span>
        </div>
      )}

      <SidebarNav
        title="Manage"
        links={navigation.map(({ label, path, icon }) => ({ label, icon, href: `${base}${path}`, exact: path === "" }))}
      />

      <div className="mt-auto">
        <DemoNotice />
      </div>
    </div>
  );
}
