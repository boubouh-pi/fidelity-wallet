"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { FlaskConical, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Fidelity Wallet logo with the name of the current workspace. */
export function SidebarBrand({ href, workspace }: { href: string; workspace: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 px-2 py-1">
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
        <Wallet size={18} />
      </span>
      <span>
        <span className="block font-semibold tracking-tight text-slate-900">Fidelity Wallet</span>
        <span className="block text-xs text-slate-500">{workspace}</span>
      </span>
    </Link>
  );
}

export interface SidebarLink {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Active only on this exact URL (e.g. a section root). */
  exact?: boolean;
}

export function SidebarNav({ title, links }: { title: string; links: SidebarLink[] }) {
  return (
    <div>
      <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
      <Suspense fallback={<NavLinks links={links} pathname="" />}>
        <ActiveNavLinks links={links} />
      </Suspense>
    </div>
  );
}

function ActiveNavLinks({ links }: { links: SidebarLink[] }) {
  return <NavLinks links={links} pathname={usePathname()} />;
}

function NavLinks({ links, pathname }: { links: SidebarLink[]; pathname: string }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {links.map(({ label, href, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Icon size={18} className={active ? "text-brand-600" : "text-slate-400"} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Reminds everyone that the prototype runs on demo data. */
export function DemoNotice() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
      <FlaskConical size={14} className="mt-0.5 shrink-0" />
      <span>
        <span className="block font-medium">Demo data</span>
        Prototype: nothing here is real account data.
      </span>
    </div>
  );
}
