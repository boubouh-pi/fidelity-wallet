import { Card } from "./Card";
import { PageHeader } from "./PageHeader";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card className="flex min-h-48 items-center justify-center border-dashed text-sm text-neutral-500">
        This section is coming soon.
      </Card>
    </>
  );
}
