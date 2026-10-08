"use client";

import { useState } from "react";
import { BarChart3, CalendarRange, Gift, TrendingDown, TrendingUp, UserPlus, Users } from "lucide-react";
import { ChartCard } from "@/components/charts/ChartCard";
import { ColumnChart } from "@/components/charts/ColumnChart";
import { LineChart } from "@/components/charts/LineChart";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { addDays, cn, formatNumber, formatShortDate } from "@/lib/utils";
import type { AnalyticsWeek, RestaurantAnalytics } from "@/types";

const RANGES = [4, 8, 12] as const;
type Range = (typeof RANGES)[number];
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const sum = (weeks: AnalyticsWeek[], key: keyof Omit<AnalyticsWeek, "weekStart">) =>
  weeks.reduce((total, w) => total + w[key], 0);

/** Signed change vs the previous period. Up is good for every metric on this page. */
function Delta({ current, previous, range }: { current: number; previous: number; range: Range }) {
  if (previous === 0) return <span className="text-slate-400">No previous data</span>;
  const change = ((current - previous) / previous) * 100;
  const up = change >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <>
      <span className={cn("inline-flex items-center gap-1 font-medium", up ? "text-emerald-600" : "text-red-600")}>
        <Icon size={14} />
        {up ? "+" : "−"}{Math.abs(change).toFixed(1)}%
      </span>
      <span className="whitespace-nowrap text-slate-400">vs previous {range} weeks</span>
    </>
  );
}

export function AnalyticsDashboard({ analytics }: { analytics: RestaurantAnalytics }) {
  const [range, setRange] = useState<Range>(12);

  if (analytics.weeks.length === 0) {
    return (
      <Card className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <BarChart3 size={22} />
        </span>
        <p className="font-medium text-slate-900">No activity yet</p>
        <p className="max-w-sm text-sm text-slate-500">
          Analytics will appear here once customers start collecting stamps on your loyalty card.
        </p>
      </Card>
    );
  }

  const current = analytics.weeks.slice(-range);
  const previous = analytics.weeks.slice(-2 * range, -range);
  const visits = sum(current, "visits");
  const redemptions = sum(current, "redemptions");
  const newMembers = sum(current, "newMembers");

  const weekly = (key: "visits" | "newMembers") =>
    current.map((w) => ({ label: formatShortDate(w.weekStart), title: `Week of ${formatShortDate(w.weekStart)}`, value: w[key] }));
  const visitsData = weekly("visits");
  const membersData = weekly("newMembers");
  const weekdayData = analytics.weekdayShare.map((share, i) => ({
    label: WEEKDAYS[i].slice(0, 3),
    title: WEEKDAYS[i],
    value: Math.round(visits * share),
  }));
  const busiest = weekdayData.reduce((best, d, i) => (d.value > weekdayData[best].value ? i : best), 0);

  const asRows = (data: { title: string; value: number }[]) =>
    data.map((d) => [d.title, formatNumber(d.value)] as [string, string]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
          <CalendarRange size={16} className="text-slate-400" />
          Period
        </span>
        <div role="group" aria-label="Period" className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                range === r ? "bg-white text-brand-700 shadow-sm" : "text-slate-600 hover:text-slate-900",
              )}
            >
              Last {r} weeks
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">
          {formatShortDate(current[0].weekStart)} – {formatShortDate(addDays(current[current.length - 1].weekStart, 6))}
        </span>
      </div>

      <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Visits" value={formatNumber(visits)} icon={Users}>
          <Delta current={visits} previous={sum(previous, "visits")} range={range} />
        </Stat>
        <Stat label="Rewards redeemed" value={formatNumber(redemptions)} icon={Gift}>
          <Delta current={redemptions} previous={sum(previous, "redemptions")} range={range} />
        </Stat>
        <Stat label="New members" value={formatNumber(newMembers)} icon={UserPlus}>
          <Delta current={newMembers} previous={sum(previous, "newMembers")} range={range} />
        </Stat>
        <Stat label="Visits per week" value={formatNumber(Math.round(visits / range))} icon={BarChart3}>
          <Delta current={visits / range} previous={previous.length ? sum(previous, "visits") / range : 0} range={range} />
        </Stat>
      </section>

      <ChartCard
        className="mt-6"
        title="Visits per week"
        description="Stamps awarded to loyalty members each week."
        table={{ columns: ["Week", "Visits"], rows: asRows(visitsData) }}
      >
        <ColumnChart data={visitsData} formatValue={formatNumber} labelIndex={visitsData.length - 1} ariaLabel="Visits per week" />
      </ChartCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="New members per week"
          description="Customers who added your card for the first time."
          table={{ columns: ["Week", "New members"], rows: asRows(membersData) }}
        >
          <LineChart data={membersData} formatValue={formatNumber} ariaLabel="New members per week" />
        </ChartCard>
        <ChartCard
          title="Busiest days"
          description={`Visits by day of the week. ${weekdayData[busiest].title} is your busiest day.`}
          table={{ columns: ["Day", "Visits"], rows: asRows(weekdayData) }}
        >
          <ColumnChart data={weekdayData} formatValue={formatNumber} emphasis={busiest} labelIndex={busiest} ariaLabel="Visits by day of the week" />
        </ChartCard>
      </div>

      <p className="mt-4 text-xs text-slate-400">Demo data. Weeks run Monday to Sunday; the current week is not included until it ends.</p>
    </>
  );
}
