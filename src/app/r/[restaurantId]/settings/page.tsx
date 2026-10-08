import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LifeBuoy } from "lucide-react";
import { RestaurantStatusBadge } from "@/components/restaurants/RestaurantStatusBadge";
import { LoyaltySettingsForm, ProfileForm } from "@/components/settings/SettingsForms";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { getRestaurant, getRestaurantSettings } from "@/services";

export default function SettingsPage(props: PageProps<"/r/[restaurantId]/settings">) {
  return (
    <>
      <PageHeader title="Settings" description="Your restaurant profile, loyalty program and account." />
      <Suspense fallback={<PageSkeleton header={false} />}>
        <SettingsContent {...props} />
      </Suspense>
    </>
  );
}

async function SettingsContent({ params }: PageProps<"/r/[restaurantId]/settings">) {
  const { restaurantId } = await params;
  const [restaurant, settings] = await Promise.all([getRestaurant(restaurantId), getRestaurantSettings(restaurantId)]);
  if (!restaurant || !settings) notFound();

  return (
    <div>
      <ProfileForm restaurantId={restaurantId} initialProfile={settings.profile} />
      <LoyaltySettingsForm
        restaurantId={restaurantId}
        initialProgram={settings.program}
        editable={settings.editableProgramFields}
      />
      <SettingsSection title="Account" description="Your Fidelity Wallet account. Managed by our team.">
        <Card>
          <dl className="divide-y divide-slate-100 text-sm">
            <div className="flex items-center justify-between gap-4 pb-3">
              <dt className="text-slate-500">Restaurant</dt>
              <dd className="font-medium text-slate-900">{restaurant.name}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-slate-500">Account status</dt>
              <dd><RestaurantStatusBadge status={restaurant.status} /></dd>
            </div>
            <div className="flex items-center justify-between gap-4 pt-3">
              <dt className="text-slate-500">Category · City</dt>
              <dd className="text-right font-medium text-slate-900">{restaurant.category} · {restaurant.city}</dd>
            </div>
          </dl>
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-brand-50 p-3 text-xs text-brand-800">
            <LifeBuoy size={14} className="mt-0.5 shrink-0" />
            To change your restaurant name, card design or other program rules, contact the Fidelity Wallet team.
          </p>
        </Card>
      </SettingsSection>
    </div>
  );
}
