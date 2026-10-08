"use client";

import { useState } from "react";
import { type ChartDatum, ChartTooltip, chartColors, niceTicks, useElementWidth } from "./chartUtils";

const MARGIN = { top: 24, right: 8, bottom: 28, left: 44 };

/** Column with a 4px rounded top and a square base. */
function columnPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}

/**
 * Single-series column chart. `emphasis` highlights one column (the rest go gray);
 * `labelIndex` writes that column's value on its cap.
 */
export function ColumnChart({
  data,
  formatValue,
  height = 240,
  emphasis,
  labelIndex,
  ariaLabel,
}: {
  data: ChartDatum[];
  formatValue: (v: number) => string;
  height?: number;
  emphasis?: number;
  labelIndex?: number;
  ariaLabel: string;
}) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = height - MARGIN.top - MARGIN.bottom;
  const ticks = niceTicks(Math.max(...data.map((d) => d.value), 0));
  const yMax = ticks[ticks.length - 1];
  const y = (v: number) => MARGIN.top + plotH - (v / yMax) * plotH;
  const band = data.length ? plotW / data.length : 0;
  const barW = Math.min(24, band * 0.6);
  // Room each axis label needs (~6.5px per character at 11px, plus spacing).
  const labelWidth = Math.max(...data.map((d) => d.label.length), 1) * 6.5 + 14;
  const labelEvery = Math.max(1, Math.ceil((data.length * labelWidth) / Math.max(plotW, 1)));

  const fill = (i: number) =>
    emphasis === undefined || i === emphasis ? chartColors.series : chartColors.deemphasis;

  return (
    <div ref={ref} className="relative" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? chartColors.axis : chartColors.grid} strokeWidth={1} />
              <text x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={chartColors.label} style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatValue(t)}
              </text>
            </g>
          ))}

          {data.map((d, i) => {
            const cx = MARGIN.left + band * i + band / 2;
            const top = y(d.value);
            const h = MARGIN.top + plotH - top;
            return (
              <g key={d.label + i}>
                {h > 0 && (
                  <path d={columnPath(cx - barW / 2, top, barW, h)} fill={fill(i)} opacity={active === null || active === i ? 1 : 0.55} />
                )}
                {i === labelIndex && (
                  <text x={cx} y={top - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--color-slate-700)">
                    {formatValue(d.value)}
                  </text>
                )}
                {i % labelEvery === 0 && (
                  <text x={cx} y={height - 8} textAnchor="middle" fontSize={11} fill={chartColors.label}>{d.label}</text>
                )}
                {/* Hit target: the whole band, not just the painted column. */}
                <rect
                  x={MARGIN.left + band * i}
                  y={MARGIN.top}
                  width={band}
                  height={plotH}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${d.title}: ${formatValue(d.value)}`}
                  className="outline-none focus-visible:fill-brand-50/60"
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                />
              </g>
            );
          })}
        </svg>
      )}
      {active !== null && data[active] && (
        <ChartTooltip
          x={Math.min(Math.max(MARGIN.left + band * active + band / 2, 60), width - 60)}
          y={y(data[active].value)}
          value={formatValue(data[active].value)}
          title={data[active].title}
        />
      )}
    </div>
  );
}
