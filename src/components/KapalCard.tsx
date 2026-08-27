"use client";

import Link from "next/link";
import { Anchor } from "lucide-react";
import { timeAgo } from "@/lib/format";
import { useCountdown } from "@/lib/client/useCountdown";
import { ChannelBar } from "./ChannelBar";
import { ShareButton } from "./ShareButton";
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
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition-shadow hover:shadow-md active:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-bold text-[var(--color-text)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand)]">
            <Anchor size={14} />
          </span>
          {k.nama}
        </span>
        <div className="flex items-center gap-1">
          {showTime && (
            <span className="font-mono text-xs text-[var(--color-text-muted)]">{timeAgo(k.lastUpdated)}</span>
          )}
          <ShareButton
            title={k.nama}
            text={`Status ${k.nama}: ${k.status === "proses" ? "sedang menyeberang" : k.status === "titik_a" ? `standby di ${tambangan?.titikA.nama ?? "titik A"}` : `standby di ${tambangan?.titikB.nama ?? "titik B"}`}`}
            url={tambangan ? `/tambangan/${tambangan.slug}` : undefined}
            compact
          />
        </div>
      </div>
      {tambanganNama && !tambangan && (
        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{tambanganNama}</p>
      )}
      <div className="mt-2.5">
        <ChannelBar status={k.status} departingFrom={k.departingFrom} compact />
      </div>
      {tambangan && (
        <div className="mt-1 flex justify-between font-mono text-xs text-[var(--color-text-muted)]">
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
