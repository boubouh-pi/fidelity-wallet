import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CustomerManagement } from "@/components/customers/CustomerManagement";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { getLoyaltyProgram, getRestaurant, getRestaurantCustomers } from "@/services";

export default function CustomersPage(props: PageProps<"/r/[restaurantId]/customers">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CustomersContent {...props} />
    </Suspense>
  );
}

async function CustomersContent({ params }: PageProps<"/r/[restaurantId]/customers">) {
  const { restaurantId } = await params;
  const [restaurant, customers, program] = await Promise.all([
    getRestaurant(restaurantId),
    getRestaurantCustomers(restaurantId),
    getLoyaltyProgram(restaurantId),
  ]);

  if (!restaurant || !program) notFound();

  return (
    <>
      <PageHeader
        title="Customers"
        description={`Sample loyalty members for ${restaurant.name}.`}
      />
      <CustomerManagement
        restaurantId={restaurant.id}
        initialCustomers={customers}
        stampsRequired={program.stampsRequired}
        rewardTitle={program.rewardTitle}
      />
    </>
  );
}
