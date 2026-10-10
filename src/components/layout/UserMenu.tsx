"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/login/actions";
import { initials } from "@/lib/utils";

/** Signed-in user's avatar with a small menu (who am I, sign out). */
export function UserMenu({ name, email }: { name: string; email: string }) {
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
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((v) => !v)}
        className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 transition-shadow hover:ring-2 hover:ring-brand-200"
      >
        {initials(name)}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogOut size={16} className="text-slate-400" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
