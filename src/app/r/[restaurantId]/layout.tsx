import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getRestaurant } from "@/services";

export default function RestaurantLayout(props: LayoutProps<"/r/[restaurantId]">) {
  return (
    <Suspense fallback={
      <div role="status" className="flex min-h-screen items-center justify-center bg-neutral-50 text-sm text-neutral-500">
        Loading restaurant dashboard...
      </div>
    }>
      <RestaurantWorkspace {...props} />
    </Suspense>
  );
}

async function RestaurantWorkspace({ children, params }: LayoutProps<"/r/[restaurantId]">) {
  const { restaurantId } = await params;
  const restaurant = await getRestaurant(restaurantId);
  if (!restaurant) notFound();
  return <AppShell restaurant={restaurant}>{children}</AppShell>;
}
