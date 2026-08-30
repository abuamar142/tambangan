import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-alt)] p-8 text-center shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
      {icon && <div className="mb-3 text-[var(--color-text-muted)]">{icon}</div>}
      <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
      {description && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
