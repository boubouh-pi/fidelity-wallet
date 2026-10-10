import { Suspense } from "react";
import { requireAdmin } from "@/auth/dal";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AppShell } from "@/components/layout/AppShell";
import { ShellHeader } from "@/components/layout/ShellHeader";
import { Badge } from "@/components/ui/Badge";
import { ShellSkeleton } from "@/components/ui/Skeleton";

/** Fidelity Wallet admin (provider side). Fidelity Wallet staff only. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <AdminWorkspace>{children}</AdminWorkspace>
    </Suspense>
  );
}

async function AdminWorkspace({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <AppShell
      sidebar={<AdminSidebar />}
      header={
        <ShellHeader
          title="Fidelity Wallet"
          subtitle="Platform administration"
          badge={<Badge tone="brand">Admin</Badge>}
          user={user}
        />
      }
    >
      {children}
    </AppShell>
  );
}
