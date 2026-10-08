import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

/** A key number with its label, used for every summary tile in the app. */
export function Stat({
  label,
  value,
  icon: Icon,
  children,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  /** Small line under the value (trend, hint...). */
  children?: React.ReactNode;
}) {
  return (
    <Card className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-slate-900">{value}</p>
        {children && <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">{children}</div>}
      </div>
      {Icon && (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon size={20} />
        </span>
      )}
    </Card>
  );
}
