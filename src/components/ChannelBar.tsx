import type { KapalStatus } from "@/lib/types";

export function ChannelBar({
  status,
  departingFrom,
  compact = false,
}: {
  status: KapalStatus;
  departingFrom?: KapalStatus | null;
  compact?: boolean;
}) {
  const dotColor = status === "proses" ? "bg-blue-600 dark:bg-blue-400" : "bg-emerald-600 dark:bg-emerald-400";
  const left =
    status === "titik_a" ? "4%" : status === "titik_b" ? "96%" : departingFrom === "titik_a" ? "70%" : departingFrom === "titik_b" ? "30%" : "50%";
  return (
    <div
      className={`relative ${compact ? "h-1.5" : "h-2"} w-full rounded-full bg-gradient-to-r from-emerald-200 via-teal-100 to-emerald-200 dark:from-emerald-800 dark:via-teal-900 dark:to-emerald-800`}
    >
      <div
        className={`absolute top-1/2 rounded-full border-2 border-white shadow-sm transition-all duration-700 motion-reduce:transition-none ${dotColor} ${
          compact ? "h-3.5 w-3.5" : "h-5 w-5"
        } ${status === "proses" ? "animate-pulse motion-reduce:animate-none" : ""}`}
        style={{ left, transform: "translate(-50%, -50%)" }}
      />
    </div>
  );
}
