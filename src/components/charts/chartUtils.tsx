"use client";

import { useEffect, useRef, useState } from "react";

/** Chart colors. Marks use the brand; furniture stays in recessive grays. */
export const chartColors = {
  series: "var(--color-brand-600)",
  deemphasis: "var(--color-slate-300)",
  grid: "var(--color-slate-200)",
  axis: "var(--color-slate-300)",
  label: "var(--color-slate-500)",
  surface: "#ffffff",
};

/** Measures an element's width so charts draw at real pixel size (crisp text at any width). */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Clean y-axis ticks (0, 250, 500...) covering `max`. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude;
  const ticks = [];
  for (let v = 0; v < max + step; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}

export interface ChartDatum {
  /** Short axis label, e.g. "Sep 28". */
  label: string;
  /** Longer label for the tooltip, e.g. "Week of Sep 28". */
  title: string;
  value: number;
}

/** Hover / focus readout: the value leads, the label follows. */
export function ChartTooltip({ x, y, value, title }: { x: number; y: number; value: string; title: string }) {
  return (
    <div
      role="presentation"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-center shadow-md"
      style={{ left: x, top: y - 8 }}
    >
      <p className="text-sm font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{title}</p>
    </div>
  );
}
