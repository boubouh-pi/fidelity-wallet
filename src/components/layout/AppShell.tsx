"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { Restaurant } from "@/types";
import { Sidebar } from "./Sidebar";

const initials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export function AppShell({ restaurant, children }: { restaurant: Restaurant; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-neutral-200 bg-white lg:block">
        <Sidebar restaurant={restaurant} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <Sidebar restaurant={restaurant} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200 bg-white/80 px-4 backdrop-blur sm:px-8">
          <button
            className="rounded-lg p-2 hover:bg-neutral-100 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-neutral-500 sm:inline">{restaurant.name}</span>
            <span className="flex size-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium">{initials(restaurant.name)}</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
