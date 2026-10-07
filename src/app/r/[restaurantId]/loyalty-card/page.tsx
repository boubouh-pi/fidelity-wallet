import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoyaltyCardPreview } from "@/components/loyalty/LoyaltyCardPreview";
import { getLoyaltyCardPreview } from "@/services";

function DetailList({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="mt-3 divide-y divide-neutral-100 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 py-2.5">
          <dt className="text-neutral-500">{k}</dt>
          <dd className="text-right font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function LoyaltyCardPage(props: PageProps<"/r/[restaurantId]/loyalty-card">) {
  return (
    <Suspense fallback={<p role="status" className="text-sm text-neutral-500">Loading loyalty card...</p>}>
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
        <div className="flex flex-col items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-100 p-8">
          <LoyaltyCardPreview data={data} />
          <p className="text-xs text-neutral-500">Preview with a sample customer</p>
        </div>
        <div className="space-y-6">
          <Card>
            <h2 className="font-medium">Loyalty program</h2>
            <p className="mt-1 text-xs text-neutral-400">Configured by Fidelity Wallet. Only approved settings will be editable by your restaurant.</p>
            <DetailList rows={[
              ["Stamps required", String(program.stampsRequired)],
              ["Reward", program.rewardTitle],
              ["Reward details", program.rewardDescription],
              ["Valid for", `${program.expiresInDays} days`],
            ]} />
          </Card>
          <Card>
            <h2 className="font-medium">Card design</h2>
            <DetailList rows={[
              ["Display name", design.displayName],
              ["Tagline", design.tagline],
            ]} />
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
              <Info size={14} className="mt-0.5 shrink-0" />
              Your card design is set up and maintained by Fidelity Wallet. Contact us to request a change.
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
