import { AlertCircle } from "lucide-react";

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-2 rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-3 text-sm text-[var(--color-danger)]"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
