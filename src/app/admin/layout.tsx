import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AppShell } from "@/components/layout/AppShell";
import { ShellHeader } from "@/components/layout/ShellHeader";
import { Badge } from "@/components/ui/Badge";

/**
 * Fidelity Wallet admin (provider side). Prototype only: there is no
 * authentication yet, so this area is not access-controlled.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AppShell
      sidebar={<AdminSidebar />}
      header={
        <ShellHeader
          title="Fidelity Wallet"
          subtitle="Platform administration"
          badge={<Badge tone="brand">Admin</Badge>}
        />
      }
    >
      {children}
    </AppShell>
  );
}
