/** One settings group: heading and explanation on the left, content on the right (stacked on mobile). */
export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 border-t border-slate-200 py-8 first:border-t-0 first:pt-0 lg:grid-cols-3 lg:gap-8">
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="lg:col-span-2">{children}</div>
    </section>
  );
}
