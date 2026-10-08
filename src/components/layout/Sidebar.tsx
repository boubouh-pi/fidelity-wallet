"use client";

import { navigation, restaurantBasePath } from "@/config/navigation";
import type { Restaurant } from "@/types";
import { DemoNotice, SidebarBrand, SidebarNav } from "./SidebarParts";

/** Restaurant dashboard sidebar. */
export function Sidebar({ restaurant }: { restaurant: Restaurant }) {
  const base = restaurantBasePath(restaurant.id);
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <SidebarBrand href={base} workspace="Restaurant dashboard" />

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
