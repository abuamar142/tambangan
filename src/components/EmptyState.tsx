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
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-base-300 bg-base-200 p-8 text-center shadow-sm transition-shadow hover:shadow-md">
      {icon && <div className="mb-3 text-base-content/50">{icon}</div>}
      <p className="text-sm font-medium text-base-content">{title}</p>
      {description && <p className="mt-1 text-xs text-base-content/50">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
