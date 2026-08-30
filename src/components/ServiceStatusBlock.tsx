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
      ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5"
      : variant === "standby"
        ? "border-[var(--color-brand)]/25 bg-[var(--color-brand)]/5"
        : "border-[var(--color-border)] bg-[var(--color-surface)]";
  const iconBg =
    variant === "active"
      ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
      : variant === "standby"
        ? "bg-[var(--color-brand)]/15 text-[var(--color-brand)]"
        : "bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]";

  return (
    <div className={`rounded-xl border p-4 shadow-md transition-shadow hover:shadow-lg ${accent}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            {label}
          </p>
          <p className="text-2xl font-extrabold tabular-nums text-[var(--color-text)]">
            {count}
          </p>
        </div>
      </div>
    </div>
  );
}
