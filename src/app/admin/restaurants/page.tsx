import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { restaurantBasePath } from "@/config/navigation";
import { cn, formatNumber } from "@/lib/utils";
import { listRestaurantSummaries } from "@/services";
import type { Restaurant } from "@/types";

const statusStyles: Record<Restaurant["status"], string> = {
  active: "bg-emerald-50 text-emerald-700",
  onboarding: "bg-amber-50 text-amber-700",
  paused: "bg-neutral-100 text-neutral-600",
};

export default function RestaurantsPage() {
  return (
    <>
      <PageHeader
        title="Restaurants"
        description="Restaurant clients with a Fidelity Wallet loyalty program. Demo data."
      />
      <Suspense fallback={<p role="status" className="text-sm text-neutral-500">Loading restaurants...</p>}>
        <RestaurantsTable />
      </Suspense>
    </>
  );
}

async function RestaurantsTable() {
  const summaries = await listRestaurantSummaries();

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Restaurant</th>
              <th scope="col" className="px-4 py-3 font-medium">City</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Loyalty program</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Loyalty members</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {summaries.map(({ restaurant, program, customerCount }) => (
              <tr key={restaurant.id} className="align-middle">
                <th scope="row" className="px-4 py-3 text-left font-medium text-neutral-900">
                  {restaurant.name}
                  <span className="block text-xs font-normal text-neutral-500">{restaurant.category}</span>
                </th>
                <td className="px-4 py-3 text-neutral-600">{restaurant.city}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium capitalize", statusStyles[restaurant.status])}>
                    {restaurant.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {program ? `${program.stampsRequired} stamps → ${program.rewardTitle}` : <span className="text-neutral-400">Not configured</span>}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(customerCount)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={restaurantBasePath(restaurant.id)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-neutral-200 px-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                  >
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
        <p className="px-4 py-10 text-center text-sm text-neutral-500">No restaurant clients yet.</p>
      )}
    </div>
  );
}
