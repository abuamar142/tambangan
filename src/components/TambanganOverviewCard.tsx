"use client";

import Link from "next/link";
import { Anchor, Ship } from "lucide-react";
import { usePolling } from "@/lib/client/usePolling";
import { api } from "@/lib/client/api";
import type { KapalLiveDto, TambanganDto } from "@/lib/types";

export function TambanganOverviewCard({ tambangan }: { tambangan: TambanganDto }) {
  const { data, loading } = usePolling<{ kapal: KapalLiveDto[] }>(
    (signal) => api(`/api/tambangan/${tambangan.slug}`, { signal }),
    4000,
  );

  const list = data?.kapal ?? [];
  const counts = {
    titik_a: list.filter((k) => k.status === "titik_a").length,
    proses: list.filter((k) => k.status === "proses").length,
    titik_b: list.filter((k) => k.status === "titik_b").length,
  };
  const total = list.length;

  // Find fastest departure from this tambangan
  const fastest = list
    .filter((k) => k.timerEndAt)
    .sort((a, b) => new Date(a.timerEndAt!).getTime() - new Date(b.timerEndAt!).getTime())[0];

  return (
    <Link
      href={`/tambangan/${tambangan.slug}`}
      className="group block animate-card-in rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg active:translate-y-0"
    >
      {/* Route name */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Anchor size={16} />
        </div>
        <h3 className="text-base font-bold text-base-content group-hover:text-primary transition-colors">
          {tambangan.nama}
        </h3>
      </div>

      {/* Crossing diagram */}
      <div className="mt-4 flex items-center justify-between gap-2">
        {/* Point A */}
        <div className="flex-1 text-center">
          <div className="text-2xl font-extrabold text-primary">{counts.titik_a}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-base-content/50">
            {tambangan.titikA.nama}
          </div>
        </div>

        {/* Crossing indicator */}
        <div className="flex flex-col items-center gap-1 px-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-base-content/50">◀</span>
            {counts.proses > 0 ? (
              <Ship size={16} className="text-accent animate-pulse" />
            ) : (
              <Ship size={16} className="text-base-content/20" />
            )}
            <span className="text-[10px] text-base-content/50">▶</span>
          </div>
          {counts.proses > 0 && (
            <span className="text-[10px] font-bold text-accent">{counts.proses}</span>
          )}
        </div>

        {/* Point B */}
        <div className="flex-1 text-center">
          <div className="text-2xl font-extrabold text-primary">{counts.titik_b}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-base-content/50">
            {tambangan.titikB.nama}
          </div>
        </div>
      </div>

      {/* Fastest departure */}
      {fastest && (
        <div className="mt-3 rounded-lg bg-accent/5 border border-accent/10 px-3 py-2 text-center">
          <span className="text-xs font-bold text-accent">{fastest.nama}</span>
        </div>
      )}

      {/* Total */}
      <div className="mt-3 text-center text-[11px] text-base-content/40">
        {total} kapal terdaftar
      </div>
    </Link>
  );
}
