"use client";

import type { KapalLiveDto, TambanganDto } from "@/lib/types";
import { KapalCard } from "./KapalCard";

export function KapalGroup({
  label,
  items,
  tambangan,
}: {
  label: string;
  items: KapalLiveDto[];
  tambangan?: TambanganDto;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label} · {items.length}
      </p>
      <div className="space-y-2">
        {items.map((k) => (
          <KapalCard key={k.slug} k={k} tambangan={tambangan} />
        ))}
      </div>
    </div>
  );
}
