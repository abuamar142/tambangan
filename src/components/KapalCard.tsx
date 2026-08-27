"use client";

import Link from "next/link";
import { Anchor } from "lucide-react";
import { timeAgo } from "@/lib/format";
import { useCountdown } from "@/lib/client/useCountdown";
import { ChannelBar } from "./ChannelBar";
import type { KapalLiveDto, TambanganDto } from "@/lib/types";

export function KapalCard({
  k,
  tambangan,
  tambanganNama,
  showTime = true,
  href,
}: {
  k: KapalLiveDto;
  tambangan?: TambanganDto;
  tambanganNama?: string;
  showTime?: boolean;
  href?: string;
}) {
  const countdown = useCountdown(k.timerEndAt);

  const card = (
    <div className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
            <Anchor size={14} />
          </span>
          {k.nama}
        </span>
        {showTime && (
          <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{timeAgo(k.lastUpdated)}</span>
        )}
      </div>
      {tambanganNama && !tambangan && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{tambanganNama}</p>
      )}
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

  if (href) {
    return <Link href={href}>{card}</Link>;
  }
  return card;
}
