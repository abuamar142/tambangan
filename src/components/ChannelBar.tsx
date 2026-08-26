import type { KapalStatus } from "@/lib/types";

export function ChannelBar({ status, compact = false }: { status: KapalStatus; compact?: boolean }) {
  const dotColor = status === "proses" ? "bg-blue-600" : "bg-emerald-600";
  const left = status === "titik_a" ? "4%" : status === "proses" ? "50%" : "96%";
  return (
    <div
      className={`relative ${compact ? "h-1.5" : "h-2"} w-full rounded-full bg-gradient-to-r from-emerald-200 via-teal-100 to-emerald-200`}
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
