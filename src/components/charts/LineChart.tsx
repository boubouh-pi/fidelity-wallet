"use client";

import { useState } from "react";
import { type ChartDatum, ChartTooltip, chartColors, niceTicks, useElementWidth } from "./chartUtils";

const MARGIN = { top: 24, right: 16, bottom: 28, left: 44 };

/** Single-series line with a soft area wash, an end marker with its value, and a crosshair readout. */
export function LineChart({
  data,
  formatValue,
  height = 240,
  ariaLabel,
}: {
  data: ChartDatum[];
  formatValue: (v: number) => string;
  height?: number;
  ariaLabel: string;
}) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = height - MARGIN.top - MARGIN.bottom;
  const ticks = niceTicks(Math.max(...data.map((d) => d.value), 0));
  const yMax = ticks[ticks.length - 1];
  const step = data.length > 1 ? plotW / (data.length - 1) : 0;
  const x = (i: number) => MARGIN.left + step * i;
  const y = (v: number) => MARGIN.top + plotH - (v / yMax) * plotH;
  const baseline = y(0);
  // Room each axis label needs (~6.5px per character at 11px, plus spacing).
  const labelWidth = Math.max(...data.map((d) => d.label.length), 1) * 6.5 + 14;
  const labelEvery = Math.max(1, Math.ceil((data.length * labelWidth) / Math.max(plotW, 1)));

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  const area = data.length ? `${line} L${x(data.length - 1)},${baseline} L${x(0)},${baseline} Z` : "";
  const last = data.length - 1;

  function pick(clientX: number, rectLeft: number) {
    if (!data.length) return;
    const i = Math.round((clientX - rectLeft - MARGIN.left) / (step || 1));
    setActive(Math.min(Math.max(i, 0), last));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setActive((i) => Math.min(Math.max((i ?? last) + (e.key === "ArrowRight" ? 1 : -1), 0), last));
  }

  const shown = active ?? null;

  return (
    <div ref={ref} className="relative" style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`${ariaLabel}. Use the arrow keys to read each week.`}
          tabIndex={0}
          className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
          onPointerMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect().left)}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive(last)}
          onBlur={() => setActive(null)}
          onKeyDown={onKeyDown}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? chartColors.axis : chartColors.grid} strokeWidth={1} />
              <text x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={chartColors.label} style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatValue(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) =>
            i % labelEvery === 0 ? (
              <text key={d.label + i} x={x(i)} y={height - 8} textAnchor={i === last ? "end" : "middle"} fontSize={11} fill={chartColors.label}>{d.label}</text>
            ) : null,
          )}

          <path d={area} fill={chartColors.series} opacity={0.1} />
          <path d={line} fill="none" stroke={chartColors.series} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {shown !== null && (
            <line x1={x(shown)} x2={x(shown)} y1={MARGIN.top} y2={baseline} stroke={chartColors.axis} strokeWidth={1} />
          )}
          {last >= 0 && (
            <>
              <circle cx={x(shown ?? last)} cy={y(data[shown ?? last].value)} r={4} fill={chartColors.series} stroke={chartColors.surface} strokeWidth={2} />
              {shown === null && (
                <text x={x(last)} y={y(data[last].value) - 10} textAnchor="end" fontSize={11} fontWeight={600} fill="var(--color-slate-700)">
                  {formatValue(data[last].value)}
                </text>
              )}
            </>
          )}
        </svg>
      )}
      {shown !== null && data[shown] && (
        <ChartTooltip
          x={Math.min(Math.max(x(shown), 60), width - 60)}
          y={y(data[shown].value)}
          value={formatValue(data[shown].value)}
          title={data[shown].title}
        />
      )}
    </div>
  );
}
