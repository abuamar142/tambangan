import { AlertCircle } from "lucide-react";

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" aria-live="polite" className="alert alert-error text-sm">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
