import { Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { initials } from "@/lib/utils";
import { getDashboardMetrics, getRecentActivity, getRestaurant } from "@/services";

export default function DashboardPage(props: PageProps<"/r/[restaurantId]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardContent {...props} />
    </Suspense>
  );
}

async function DashboardContent({ params }: PageProps<"/r/[restaurantId]">) {
  const { restaurantId } = await params;
  const [restaurant, metrics, activity] = await Promise.all([
    getRestaurant(restaurantId),
    getDashboardMetrics(restaurantId),
    getRecentActivity(restaurantId),
  ]);
  return (
    <>
      <PageHeader title="Dashboard" description={`Overview of the loyalty program at ${restaurant?.name ?? "your restaurant"}.`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => <StatCard key={m.id} metric={m} />)}
      </div>
      <Card className="mt-6">
        <h2 className="font-semibold text-slate-900">Recent activity</h2>
        {activity.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No activity yet. It will appear here once customers add your card.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {initials(a.customer)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-medium text-slate-900">{a.customer}</span>{" "}
                  <span className="text-slate-500">· {a.action}</span>
                </span>
                <span className="whitespace-nowrap text-xs text-slate-400">{a.time}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
