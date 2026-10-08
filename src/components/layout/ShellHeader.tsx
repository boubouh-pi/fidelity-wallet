import { initials } from "@/lib/utils";

/** Top bar content: which account or workspace is being viewed. */
export function ShellHeader({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-slate-900">{title}</p>
          {badge}
        </div>
        <p className="truncate text-xs text-slate-500">{subtitle}</p>
      </div>
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700"
      >
        {initials(title)}
      </span>
    </div>
  );
}
