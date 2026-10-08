"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { restaurantBasePath } from "@/config/navigation";
import { cn, initials } from "@/lib/utils";
import type { Restaurant } from "@/types";

export type RestaurantOption = Pick<Restaurant, "id" | "name" | "city">;

/**
 * Prototype convenience: switch between demo restaurants or go back to the
 * admin list. Once authentication exists, a restaurant user will only see
 * their own account and this switcher will be limited to Fidelity Wallet staff.
 */
export function RestaurantSwitcher({ current, restaurants }: { current: Restaurant; restaurants: RestaurantOption[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition-colors hover:bg-slate-50"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-50 text-xs font-semibold text-brand-700">
          {initials(current.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-900">{current.name}</span>
          <span className="block text-xs text-slate-500">Switch restaurant</span>
        </span>
        <ChevronsUpDown size={16} className="shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <p className="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wider text-slate-400">Demo restaurants</p>
          <Suspense fallback={<RestaurantLinks current={current} restaurants={restaurants} section="" onPick={() => setOpen(false)} />}>
            <SectionAwareLinks current={current} restaurants={restaurants} onPick={() => setOpen(false)} />
          </Suspense>
          <Link
            href="/admin/restaurants"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            <ArrowLeft size={16} />
            All restaurants
          </Link>
        </div>
      )}
    </div>
  );
}

/** Keeps the current section when switching (Customers -> the other restaurant's Customers). */
function SectionAwareLinks(props: { current: Restaurant; restaurants: RestaurantOption[]; onPick: () => void }) {
  const pathname = usePathname();
  const section = pathname.slice(restaurantBasePath(props.current.id).length);
  return <RestaurantLinks {...props} section={section} />;
}

function RestaurantLinks({
  current,
  restaurants,
  section,
  onPick,
}: {
  current: Restaurant;
  restaurants: RestaurantOption[];
  section: string;
  onPick: () => void;
}) {
  return (
    <ul className="p-1">
      {restaurants.map((r) => {
        const selected = r.id === current.id;
        return (
          <li key={r.id}>
            <Link
              href={`${restaurantBasePath(r.id)}${section}`}
              onClick={onPick}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-2 text-sm",
                selected ? "bg-slate-50" : "hover:bg-slate-50",
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">
                {initials(r.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-slate-900">{r.name}</span>
                <span className="block text-xs text-slate-500">{r.city}</span>
              </span>
              {selected && <Check size={16} className="shrink-0 text-brand-600" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
