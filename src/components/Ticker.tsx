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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-danger)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-danger)]">
        Waktu habis
      </span>
    );
  }

  if (compact) {
    return (
      <span className="font-mono text-xs font-bold text-[var(--color-accent)]">
        {countdown.display}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
          {label}
        </p>
      )}
      <div className="rounded-xl bg-[var(--color-surface)] p-4 shadow-lg ring-1 ring-[var(--color-accent)]/15 shadow-[var(--shadow-glow-amber)]">
        <p className="font-mono text-3xl font-extrabold tracking-tight text-[var(--color-accent)] tabular-nums">
          {countdown.display}
        </p>
      </div>
    </div>
  );
}
