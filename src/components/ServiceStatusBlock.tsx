import type { ReactNode } from "react";

export function ServiceStatusBlock({
  label,
  count,
  icon,
  variant = "default",
}: {
  label: string;
  count: number;
  icon: ReactNode;
  variant?: "default" | "active" | "standby";
}) {
  const accent =
    variant === "active"
      ? "border-accent/30 bg-accent/5"
      : variant === "standby"
        ? "border-primary/25 bg-primary/5"
        : "border-base-300 bg-base-100";
  const iconBg =
    variant === "active"
      ? "bg-accent/15 text-accent"
      : variant === "standby"
        ? "bg-primary/15 text-primary"
        : "bg-base-300 text-base-content/60";

  return (
    <div className={`rounded-xl border p-4 shadow-md transition-shadow hover:shadow-lg ${accent}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
            {label}
          </p>
          <p className="text-2xl font-extrabold tabular-nums text-base-content">
            {count}
          </p>
        </div>
      </div>
    </div>
  );
}
