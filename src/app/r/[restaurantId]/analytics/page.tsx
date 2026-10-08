import { Suspense } from "react";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { getAnalytics } from "@/services";

export default function AnalyticsPage(props: PageProps<"/r/[restaurantId]/analytics">) {
  return (
    <>
      <PageHeader title="Analytics" description="How your loyalty program is performing over time." />
      <Suspense fallback={<PageSkeleton header={false} />}>
        <AnalyticsContent {...props} />
      </Suspense>
    </>
  );
}

async function AnalyticsContent({ params }: PageProps<"/r/[restaurantId]/analytics">) {
  const { restaurantId } = await params;
  const analytics = await getAnalytics(restaurantId);
  return <AnalyticsDashboard analytics={analytics} />;
}
