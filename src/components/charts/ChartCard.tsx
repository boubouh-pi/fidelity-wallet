"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Chart container with a title and a Chart / Table toggle (the table is the accessible twin). */
export function ChartCard({
  title,
  description,
  table,
  className,
  children,
}: {
  title: string;
  description: string;
  table: { columns: [string, string]; rows: [string, string][] };
  className?: string;
  children: React.ReactNode;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <figure className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <figcaption>
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </figcaption>
        <div role="group" aria-label={`${title} view`} className="flex shrink-0 gap-0.5 rounded-lg bg-slate-100 p-0.5">
          {(["chart", "table"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                view === v ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-800",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "chart" ? (
        children
      ) : (
        <div className="max-h-60 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white text-xs text-slate-500">
              <tr>
                <th scope="col" className="py-2 font-medium">{table.columns[0]}</th>
                <th scope="col" className="py-2 text-right font-medium">{table.columns[1]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.rows.map(([label, value]) => (
                <tr key={label}>
                  <td className="py-2 text-slate-600">{label}</td>
                  <td className="py-2 text-right font-medium tabular-nums text-slate-900">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}
