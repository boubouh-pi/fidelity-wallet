import Link from "next/link";
import { Wallet } from "lucide-react";
import { adminNavigation } from "@/config/navigation";

/** Shell for the Fidelity Wallet admin (provider side). Separate from the restaurant AppShell. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-8">
          <Link href={adminNavigation[0].path} className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <Wallet size={16} />
            </span>
            <span>
              <span className="block font-semibold tracking-tight">Fidelity Wallet</span>
              <span className="block text-[10px] text-neutral-500">Admin</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {adminNavigation.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                href={path}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
