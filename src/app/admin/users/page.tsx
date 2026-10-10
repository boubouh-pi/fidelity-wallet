import { Suspense } from "react";
import { requireAdmin } from "@/auth/dal";
import { AccountManager } from "@/components/accounts/AccountManager";
import { PasswordForm } from "@/components/accounts/PasswordForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { listAccounts, listRestaurants } from "@/services";

export default function AccountsPage() {
  return (
    <>
      <PageHeader title="Accounts" description="Who can sign in. Restaurant teams only see their own restaurant." />
      <Suspense fallback={<PageSkeleton header={false} />}>
        <AccountsContent />
      </Suspense>
    </>
  );
}

async function AccountsContent() {
  const me = await requireAdmin();
  const [accounts, restaurants] = await Promise.all([listAccounts(), listRestaurants()]);
  return (
    <>
      <AccountManager
        initialAccounts={accounts}
        restaurants={restaurants.map(({ id, name }) => ({ id, name }))}
        currentUserId={me.id}
      />
      <div className="mt-10">
        <PasswordForm name={me.name} email={me.email} />
      </div>
    </>
  );
}
