import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Gift, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { restaurantBasePath } from "@/config/navigation";
import { initials } from "@/lib/utils";
import { getLoyaltyProgram, getRedemptions, getRewardReadyCustomers } from "@/services";

export default function RewardsPage(props: PageProps<"/r/[restaurantId]/rewards">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
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

      <section className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <Gift size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-brand-700">Current reward</p>
              <Badge tone="brand">Managed by Fidelity Wallet</Badge>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{program.rewardTitle}</h2>
            <p className="mt-1 text-sm text-slate-600">{program.rewardDescription}</p>
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Unlocks after</dt>
                <dd className="font-semibold text-slate-900">{program.stampsRequired} stamps</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Valid for</dt>
                <dd className="font-semibold text-slate-900">{program.expiresInDays} days</dd>
              </div>
            </dl>
          </div>
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
          <Info size={14} className="mt-0.5 shrink-0" />
          Contact Fidelity Wallet to request a change to your reward.
        </p>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">Ready to redeem</h2>
            <Badge tone={readyCustomers.length > 0 ? "success" : "neutral"}>{readyCustomers.length}</Badge>
          </div>
          {readyCustomers.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No customer has a full card right now.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {readyCustomers.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-3 text-sm">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                    {initials(c.name)}
                  </span>
                  <span className="min-w-0 flex-1 font-medium text-slate-900">{c.name}</span>
                  <span className="font-mono text-xs text-slate-500">{c.memberId}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href={`${restaurantBasePath(restaurantId)}/customers`} className={`${buttonClass({ size: "sm" })} mt-4`}>
            Redeem from Customers
            <ArrowRight size={14} />
          </Link>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900">Recent redemptions</h2>
          {redemptions.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No rewards redeemed yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {redemptions.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-3 text-sm">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {initials(r.customerName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-medium text-slate-900">{r.customerName}</span>{" "}
                    <span className="text-slate-500">· {r.rewardTitle}</span>
                  </span>
                  <span className="whitespace-nowrap text-xs text-slate-400">{r.redeemedAt}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
