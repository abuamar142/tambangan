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
  const dotColor = status === "proses" ? "bg-[var(--color-info)]" : "bg-[var(--color-success)]";
  const left =
    status === "titik_a" ? "4%" : status === "titik_b" ? "96%" : departingFrom === "titik_a" ? "70%" : departingFrom === "titik_b" ? "30%" : "50%";
  return (
    <div
      role="meter"
      aria-label={`Posisi kapal: ${status === "proses" ? "sedang menyeberang" : status === "titik_a" ? "standby di titik A" : "standby di titik B"}`}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`relative ${compact ? "h-1.5" : "h-2"} w-full rounded-full bg-gradient-to-r from-[var(--color-brand-200)] via-[var(--color-brand-100)] to-[var(--color-brand-200)]`}
    >
      <div
        className={`absolute top-1/2 rounded-full border-2 border-[var(--color-surface)] shadow-sm transition-all duration-700 motion-reduce:transition-none ${dotColor} ${
          compact ? "h-3.5 w-3.5" : "h-5 w-5"
        } ${status === "proses" ? "animate-pulse motion-reduce:animate-none" : ""}`}
        style={{ left, transform: "translate(-50%, -50%)" }}
      />
    </div>
  );
}
