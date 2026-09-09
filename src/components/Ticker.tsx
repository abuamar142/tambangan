"use client";

import { useCountdown } from "@/lib/client/useCountdown";

export function Ticker({
  timerEndAt,
  label,
  compact = false,
}: {
  timerEndAt: string | null;
  label?: string;
  compact?: boolean;
}) {
  const countdown = useCountdown(timerEndAt);

  if (!countdown) return null;

  if (countdown.expired) {
    return (
      <span className="badge badge-error text-xs">
        Waktu habis
      </span>
    );
  }

  if (compact) {
    return (
      <span className="font-mono text-xs font-bold text-accent">
        {countdown.display}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <p className="text-xs font-semibold uppercase tracking-widest text-base-content/60">
          {label}
        </p>
      )}
      <div className="card bg-base-200 p-4 shadow-lg ring-1 ring-accent/15 shadow-[var(--shadow-glow-amber)]">
        <p className="font-mono text-3xl font-extrabold tracking-tight text-accent tabular-nums">
          {countdown.display}
        </p>
      </div>
    </div>
  );
}
