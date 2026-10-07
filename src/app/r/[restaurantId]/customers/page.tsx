import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CustomerManagement } from "@/components/customers/CustomerManagement";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLoyaltyCardPreview, getRestaurant, getRestaurantCustomers } from "@/services";

export default function CustomersPage(props: PageProps<"/r/[restaurantId]/customers">) {
  return (
    <Suspense fallback={<p role="status" className="text-sm text-neutral-500">Loading customers...</p>}>
      <CustomersContent {...props} />
    </Suspense>
  );
}

async function CustomersContent({ params }: PageProps<"/r/[restaurantId]/customers">) {
  const { restaurantId } = await params;
  const [restaurant, customers, cardPreview] = await Promise.all([
    getRestaurant(restaurantId),
    getRestaurantCustomers(restaurantId),
    getLoyaltyCardPreview(restaurantId),
  ]);

  if (!restaurant || !cardPreview) notFound();

  return (
    <>
      <PageHeader
        title="Customers"
        description={`Sample loyalty members for ${restaurant.name}.`}
      />
      <CustomerManagement
        initialCustomers={customers}
        stampsRequired={cardPreview.card.program.stampsRequired}
        rewardTitle={cardPreview.card.program.rewardTitle}
      />
    </>
  );
}
