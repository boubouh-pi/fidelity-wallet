"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Wallet } from "lucide-react";
import { navigation, restaurantBasePath } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { Restaurant } from "@/types";

export function Sidebar({ restaurant, onNavigate }: { restaurant: Restaurant; onNavigate?: () => void }) {
  const base = restaurantBasePath(restaurant.id);
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href={base} className="flex items-center gap-2 px-2 py-1" onClick={onNavigate}>
        <span className="flex size-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
          <Wallet size={16} />
        </span>
        <span>
          <span className="block font-semibold tracking-tight">Fidelity Wallet</span>
          <span className="block text-[10px] text-neutral-500">Restaurant dashboard</span>
        </span>
      </Link>

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
        <p className="text-[10px] uppercase tracking-wider text-neutral-400">Restaurant account</p>
        <p className="truncate text-sm font-medium">{restaurant.name}</p>
        <p className="truncate text-xs text-neutral-500">{restaurant.category} · {restaurant.city}</p>
      </div>

      <Suspense fallback={<NavigationLinks base={base} pathname="" onNavigate={onNavigate} />}>
        <ActiveNavigation base={base} onNavigate={onNavigate} />
      </Suspense>
    </div>
  );
}

function ActiveNavigation({ base, onNavigate }: { base: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return <NavigationLinks base={base} pathname={pathname} onNavigate={onNavigate} />;
}

function NavigationLinks({
  base,
  pathname,
  onNavigate,
}: {
  base: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {navigation.map(({ label, path, icon: Icon }) => {
        const href = `${base}${path}`;
        const active = path === "" ? pathname === base : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100",
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
