import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireRestaurantAccess } from "@/auth/dal";
import { AppShell } from "@/components/layout/AppShell";
import { ShellHeader } from "@/components/layout/ShellHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { RestaurantStatusBadge } from "@/components/restaurants/RestaurantStatusBadge";
import { ShellSkeleton } from "@/components/ui/Skeleton";
import { getRestaurant, listRestaurants } from "@/services";

export default function RestaurantLayout(props: LayoutProps<"/r/[restaurantId]">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <RestaurantWorkspace {...props} />
    </Suspense>
  );
}

async function RestaurantWorkspace({ children, params }: LayoutProps<"/r/[restaurantId]">) {
  const { restaurantId } = await params;
  const user = await requireRestaurantAccess(restaurantId);
  const [restaurant, restaurants] = await Promise.all([getRestaurant(restaurantId), listRestaurants()]);
  if (!restaurant) notFound();
  return (
    <AppShell
      sidebar={
        <Sidebar
          restaurant={restaurant}
          restaurants={user.role === "admin" ? restaurants.map(({ id, name, city }) => ({ id, name, city })) : null}
        />
      }
      header={
        <ShellHeader
          title={restaurant.name}
          subtitle={`${restaurant.category} · ${restaurant.city}`}
          badge={<RestaurantStatusBadge status={restaurant.status} />}
          user={user}
        />
      }
    >
      {children}
    </AppShell>
  );
}
