import { Suspense } from "react";
import { PromotionManager } from "@/components/promotions/PromotionManager";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { getPromotions, getToday } from "@/services";

export default function PromotionsPage(props: PageProps<"/r/[restaurantId]/promotions">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PromotionsContent {...props} />
    </Suspense>
  );
}

async function PromotionsContent({ params }: PageProps<"/r/[restaurantId]/promotions">) {
  const { restaurantId } = await params;
  const [promotions, today] = await Promise.all([getPromotions(restaurantId), getToday()]);

  return <PromotionManager restaurantId={restaurantId} initialPromotions={promotions} today={today} />;
}
