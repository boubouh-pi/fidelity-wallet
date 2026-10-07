import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn, formatNumber } from "@/lib/utils";
import type { DashboardMetric } from "@/types";

export function StatCard({ metric }: { metric: DashboardMetric }) {
  const up = metric.change >= 0;
  const Trend = up ? TrendingUp : TrendingDown;
  return (
    <Card>
      <p className="text-sm text-neutral-500">{metric.label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{formatNumber(metric.value)}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {metric.change !== 0 && (
          <span className={cn("inline-flex items-center gap-1 font-medium", up ? "text-emerald-600" : "text-red-600")}>
            <Trend size={14} />
            {Math.abs(metric.change)}%
          </span>
        )}
        <span className="text-neutral-400">{metric.hint}</span>
      </div>
    </Card>
  );
}
