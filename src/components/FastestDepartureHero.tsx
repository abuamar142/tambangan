"use client";

import { Zap } from "lucide-react";
import { useCountdown } from "@/lib/client/useCountdown";
import type { KapalLiveDto, TambanganDto } from "@/lib/types";

export function FastestDepartureHero({
  ship,
  tambangan,
}: {
  ship: KapalLiveDto;
  tambangan: TambanganDto;
}) {
  const countdown = useCountdown(ship.timerEndAt);

  if (!countdown || countdown.expired) return null;

  const pointName = ship.status === "titik_a" ? tambangan.titikA.nama : tambangan.titikB.nama;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-base-100 p-6 shadow-lg ring-1 ring-accent/10 transition-shadow hover:shadow-xl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.12),transparent)]" />
      <div className="relative">
        <div className="flex items-center gap-2 text-accent">
          <Zap size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Berangkat Tercepat</span>
        </div>

        {/* Giant countdown */}
        <div className="mt-3 font-mono text-4xl font-extrabold tracking-tight text-accent md:text-5xl">
          {countdown.display}
        </div>
        <p className="mt-1 font-mono text-sm text-base-content/70">menit lagi</p>

        {/* Ship info */}
        <div className="mt-4 border-t border-base-300 pt-3">
          <p className="text-base font-bold text-base-content">{ship.nama}</p>
          <p className="text-sm text-base-content/70">Standby di {pointName}</p>
        </div>
      </div>
    </div>
  );
}
