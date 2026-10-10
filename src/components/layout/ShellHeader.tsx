import { UserMenu } from "./UserMenu";

/** Top bar content: which account or workspace is being viewed, and who is signed in. */
export function ShellHeader({
  title,
  subtitle,
  badge,
  user,
}: {
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  user: { name: string; email: string };
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
      <UserMenu name={user.name} email={user.email} />
    </div>
  );
}
