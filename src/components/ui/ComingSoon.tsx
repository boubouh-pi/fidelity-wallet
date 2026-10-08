import type { LucideIcon } from "lucide-react";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";

export function ComingSoon({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card className="flex min-h-64 flex-col items-center justify-center gap-3 border-dashed text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon size={22} />
        </span>
        <Badge tone="brand">Coming soon</Badge>
        <p className="max-w-sm text-sm text-slate-500">
          This section is being built and will be available in a future update.
        </p>
      </Card>
    </>
  );
}
