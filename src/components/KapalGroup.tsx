"use client";

import { Anchor } from "lucide-react";
import { timeAgo } from "@/lib/format";
import type { KapalLiveDto, TambanganDto } from "@/lib/types";
import { useCountdown } from "@/lib/client/useCountdown";
import { ChannelBar } from "./ChannelBar";

function KapalItem({
  k,
  tambangan,
}: {
  k: KapalLiveDto;
  tambangan?: TambanganDto;
}) {
  const countdown = useCountdown(k.timerEndAt);
  return (
    <div className="rounded-xl border border-teal-100 bg-white p-3.5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
          <Anchor size={15} className="text-teal-600 dark:text-teal-400" />
          {k.nama}
        </span>
        <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{timeAgo(k.lastUpdated)}</span>
      </div>
      <div className="mt-2.5">
        <ChannelBar status={k.status} departingFrom={k.departingFrom} compact />
      </div>
      {tambangan && (
        <div className="mt-1 flex justify-between font-mono text-xs text-slate-500 dark:text-slate-400">
          <span>{tambangan.titikA.nama}</span>
          <span>{tambangan.titikB.nama}</span>
        </div>
      )}
      {countdown && (
        <p className="mt-2 font-mono text-xs font-semibold text-amber-700 dark:text-amber-400">
          {countdown.expired
            ? "Waktu habis"
            : `${countdown.display} lagi berangkat`}
        </p>
      )}
    </div>
  );
}

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
          <KapalItem key={k.slug} k={k} tambangan={tambangan} />
        ))}
      </div>
    </div>
  );
}
