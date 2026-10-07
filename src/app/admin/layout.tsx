import { AdminShell } from "@/components/layout/AdminShell";

/**
 * Fidelity Wallet admin (provider side). Prototype only: there is no
 * authentication yet, so this area is not access-controlled.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
