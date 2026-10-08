import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none",
  secondary: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 disabled:text-slate-300 disabled:shadow-none",
};

const sizes = {
  sm: "h-8 gap-1.5 px-2.5 text-xs",
  md: "h-9 gap-2 px-3.5 text-sm",
};

/** Button styles, also usable on links: <Link className={buttonClass()}>. */
export function buttonClass({
  variant = "secondary",
  size = "md",
}: { variant?: keyof typeof variants; size?: keyof typeof sizes } = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & Parameters<typeof buttonClass>[0]) {
  return <button type={type} className={cn(buttonClass({ variant, size }), className)} {...props} />;
}
