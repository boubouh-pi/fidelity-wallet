import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Store, Users, Wallet } from "lucide-react";
import { RestaurantStatusBadge } from "@/components/restaurants/RestaurantStatusBadge";
import { buttonClass } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Stat } from "@/components/ui/Stat";
import { restaurantBasePath } from "@/config/navigation";
import { formatNumber, initials } from "@/lib/utils";
import { listRestaurantSummaries } from "@/services";

export default function RestaurantsPage() {
  return (
    <>
      <PageHeader
        title="Restaurants"
        description="Restaurant clients with a Fidelity Wallet loyalty program."
      />
      <Suspense fallback={<PageSkeleton header={false} />}>
        <RestaurantsOverview />
      </Suspense>
    </>
  );
}

async function RestaurantsOverview() {
  const summaries = await listRestaurantSummaries();
  const activeCount = summaries.filter((s) => s.restaurant.status === "active").length;
  const memberCount = summaries.reduce((total, s) => total + s.customerCount, 0);

  return (
    <>
      <section aria-label="Portfolio summary" className="grid gap-4 sm:grid-cols-3">
        <Stat label="Restaurant clients" value={formatNumber(summaries.length)} icon={Store}>
          All accounts
        </Stat>
        <Stat label="Active programs" value={formatNumber(activeCount)} icon={Wallet}>
          Live loyalty cards
        </Stat>
        <Stat label="Loyalty members" value={formatNumber(memberCount)} icon={Users}>
          Across all restaurants
        </Stat>
      </section>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Restaurant</th>
                <th scope="col" className="px-4 py-3 font-medium">City</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Loyalty program</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Members</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaries.map(({ restaurant, program, customerCount }) => (
                <tr key={restaurant.id} className="align-middle transition-colors hover:bg-slate-50/60">
                  <th scope="row" className="px-4 py-3 text-left font-medium text-slate-900">
                    <span className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-semibold text-brand-700">
                        {initials(restaurant.name)}
                      </span>
                      <span>
                        {restaurant.name}
                        <span className="block text-xs font-normal text-slate-500">{restaurant.category}</span>
                      </span>
                    </span>
                  </th>
                  <td className="px-4 py-3 text-slate-600">{restaurant.city}</td>
                  <td className="px-4 py-3"><RestaurantStatusBadge status={restaurant.status} /></td>
                  <td className="px-4 py-3 text-slate-600">
                    {program ? (
                      <>
                        <span className="font-medium text-slate-900">{program.rewardTitle}</span>
                        <span className="block text-xs text-slate-500">after {program.stampsRequired} stamps</span>
                      </>
                    ) : (
                      <span className="text-slate-400">Not configured</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">{formatNumber(customerCount)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={restaurantBasePath(restaurant.id)} className={buttonClass({ size: "sm" })}>
                      Open dashboard
                      <ArrowUpRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {summaries.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-500">No restaurant clients yet.</p>
        )}
      </div>
    </>
  );
}
