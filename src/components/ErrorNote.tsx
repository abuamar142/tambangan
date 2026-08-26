import { AlertCircle } from "lucide-react";

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
