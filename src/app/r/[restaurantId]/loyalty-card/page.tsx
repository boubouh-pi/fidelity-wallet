import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { LoyaltyCardPreview } from "@/components/loyalty/LoyaltyCardPreview";
import { getLoyaltyCardPreview } from "@/services";

function DetailList({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="mt-3 divide-y divide-slate-100 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 py-2.5">
          <dt className="text-slate-500">{k}</dt>
          <dd className="text-right font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function LoyaltyCardPage(props: PageProps<"/r/[restaurantId]/loyalty-card">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LoyaltyCardContent {...props} />
    </Suspense>
  );
}

async function LoyaltyCardContent({ params }: PageProps<"/r/[restaurantId]/loyalty-card">) {
  const { restaurantId } = await params;
  const data = await getLoyaltyCardPreview(restaurantId);
  if (!data) notFound();
  const { design, program } = data.card;

  return (
    <>
      <PageHeader
        title="Loyalty Card"
        description="The card your customers add to Apple Wallet or Google Wallet."
      />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50 p-8">
          <LoyaltyCardPreview data={data} />
          <Badge tone="neutral">Preview with a sample customer</Badge>
        </div>
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900">Loyalty program</h2>
              <Badge tone="brand">Managed by Fidelity Wallet</Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">Only approved settings will be editable by your restaurant.</p>
            <DetailList rows={[
              ["Stamps required", String(program.stampsRequired)],
              ["Reward", program.rewardTitle],
              ["Reward details", program.rewardDescription],
              ["Valid for", `${program.expiresInDays} days`],
            ]} />
          </Card>
          <Card>
            <h2 className="font-semibold text-slate-900">Card design</h2>
            <DetailList rows={[
              ["Display name", design.displayName],
              ["Tagline", design.tagline],
            ]} />
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-brand-50 p-3 text-xs text-brand-800">
              <Info size={14} className="mt-0.5 shrink-0" />
              Your card design is set up and maintained by Fidelity Wallet. Contact us to request a change.
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
