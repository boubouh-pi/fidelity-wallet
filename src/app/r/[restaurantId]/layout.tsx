import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ShellHeader } from "@/components/layout/ShellHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { RestaurantStatusBadge } from "@/components/restaurants/RestaurantStatusBadge";
import { ShellSkeleton } from "@/components/ui/Skeleton";
import { getRestaurant } from "@/services";

export default function RestaurantLayout(props: LayoutProps<"/r/[restaurantId]">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <RestaurantWorkspace {...props} />
    </Suspense>
  );
}

async function RestaurantWorkspace({ children, params }: LayoutProps<"/r/[restaurantId]">) {
  const { restaurantId } = await params;
  const restaurant = await getRestaurant(restaurantId);
  if (!restaurant) notFound();
  return (
    <AppShell
      sidebar={<Sidebar restaurant={restaurant} />}
      header={
        <ShellHeader
          title={restaurant.name}
          subtitle={`${restaurant.category} · ${restaurant.city}`}
          badge={<RestaurantStatusBadge status={restaurant.status} />}
        />
      }
    >
      {children}
    </AppShell>
  );
}
