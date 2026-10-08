"use client";

import { adminNavigation } from "@/config/navigation";
import { DemoNotice, SidebarBrand, SidebarNav } from "./SidebarParts";

/** Fidelity Wallet admin (provider side) sidebar. Kept separate from the restaurant sidebar. */
export function AdminSidebar() {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <SidebarBrand href={adminNavigation[0].path} workspace="Admin" />

      <SidebarNav
        title="Platform"
        links={adminNavigation.map(({ label, path, icon }) => ({ label, icon, href: path }))}
      />

      <div className="mt-auto">
        <DemoNotice />
      </div>
    </div>
  );
}
