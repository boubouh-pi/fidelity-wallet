import { Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { getDashboardMetrics, getRecentActivity, getRestaurant } from "@/services";

export default function DashboardPage(props: PageProps<"/r/[restaurantId]">) {
  return (
    <Suspense fallback={<p role="status" className="text-sm text-neutral-500">Loading dashboard...</p>}>
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
      <PageHeader title="Dashboard" description={`Your Fidelity Wallet loyalty program at ${restaurant?.name}.`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => <StatCard key={m.id} metric={m} />)}
      </div>
      <Card className="mt-6">
        <h2 className="font-medium">Recent activity</h2>
        {activity.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">No activity yet. It will appear here once customers add your card.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                <span><span className="font-medium">{a.customer}</span> <span className="text-neutral-500">· {a.action}</span></span>
                <span className="text-xs text-neutral-400">{a.time}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
