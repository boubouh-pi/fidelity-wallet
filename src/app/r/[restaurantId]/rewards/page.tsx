import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Gift, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { restaurantBasePath } from "@/config/navigation";
import { getLoyaltyProgram, getRedemptions, getRewardReadyCustomers } from "@/services";

export default function RewardsPage(props: PageProps<"/r/[restaurantId]/rewards">) {
  return (
    <Suspense fallback={<p role="status" className="text-sm text-neutral-500">Loading rewards...</p>}>
      <RewardsContent {...props} />
    </Suspense>
  );
}

async function RewardsContent({ params }: PageProps<"/r/[restaurantId]/rewards">) {
  const { restaurantId } = await params;
  const [program, readyCustomers, redemptions] = await Promise.all([
    getLoyaltyProgram(restaurantId),
    getRewardReadyCustomers(restaurantId),
    getRedemptions(restaurantId),
  ]);
  if (!program) notFound();

  return (
    <>
      <PageHeader title="Rewards" description="What your customers earn, and who is ready to claim it." />

      <Card>
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
            <Gift size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-neutral-500">Current reward</p>
            <h2 className="mt-0.5 text-lg font-semibold">{program.rewardTitle}</h2>
            <p className="mt-1 text-sm text-neutral-600">{program.rewardDescription}</p>
            <p className="mt-3 text-sm text-neutral-500">
              Unlocks after <span className="font-medium text-neutral-900">{program.stampsRequired} stamps</span>
              {" · "}valid for <span className="font-medium text-neutral-900">{program.expiresInDays} days</span>
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
          <Info size={14} className="mt-0.5 shrink-0" />
          Your reward is configured by Fidelity Wallet. Contact us to request a change.
        </div>
      </Card>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-medium">
            Ready to redeem <span className="ml-1 text-neutral-400">{readyCustomers.length}</span>
          </h2>
          {readyCustomers.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">No customer has a full card right now.</p>
          ) : (
            <ul className="mt-3 divide-y divide-neutral-100">
              {readyCustomers.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="font-mono text-xs text-neutral-500">{c.memberId}</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={`${restaurantBasePath(restaurantId)}/customers`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            Redeem from Customers
            <ArrowRight size={14} />
          </Link>
        </Card>

        <Card>
          <h2 className="font-medium">Recent redemptions</h2>
          {redemptions.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">No rewards redeemed yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-neutral-100">
              {redemptions.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>
                    <span className="font-medium">{r.customerName}</span>{" "}
                    <span className="text-neutral-500">· {r.rewardTitle}</span>
                  </span>
                  <span className="whitespace-nowrap text-xs text-neutral-400">{r.redeemedAt}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
