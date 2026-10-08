import { CreditCard, Gift, Megaphone, TrendingDown, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { Stat } from "@/components/ui/Stat";
import { cn, formatNumber } from "@/lib/utils";
import type { DashboardMetric } from "@/types";

const icons: Record<string, LucideIcon> = {
  customers: Users,
  cards: CreditCard,
  redeemed: Gift,
  promos: Megaphone,
};

export function StatCard({ metric }: { metric: DashboardMetric }) {
  const up = metric.change >= 0;
  const Trend = up ? TrendingUp : TrendingDown;
  return (
    <Stat label={metric.label} value={formatNumber(metric.value)} icon={icons[metric.id]}>
      {metric.change !== 0 && (
        <span className={cn("inline-flex items-center gap-1 font-medium", up ? "text-emerald-600" : "text-red-600")}>
          <Trend size={14} />
          {Math.abs(metric.change)}%
        </span>
      )}
      <span className="text-slate-400">{metric.hint}</span>
    </Stat>
  );
}
