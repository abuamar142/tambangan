"use client";

import Link from "next/link";
import { RefreshCw, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TambanganOverviewCard } from "./TambanganOverviewCard";
import { FastestDepartureHero } from "./FastestDepartureHero";
import { ErrorNote } from "./ErrorNote";
import { EmptyState } from "./EmptyState";
import { SkeletonCard } from "./Skeleton";
import { api } from "@/lib/client/api";
import { usePolling } from "@/lib/client/usePolling";
import type { KapalMineDto, TambanganDto } from "@/lib/types";

export function HomeTambanganSection() {
  const [tambanganList, setTambanganList] = useState<TambanganDto[]>([]);

  useEffect(() => {
    api<{ tambangan: TambanganDto[] }>("/api/tambangan")
      .then((r) => setTambanganList(r.tambangan))
      .catch(() => {});
  }, []);

  // Fetch all ships to find fastest departure across all tambangan
  const { data, error, loading, refreshing, refresh } = usePolling<{ kapal: KapalMineDto[] }>(
    (signal) => api("/api/kapal?limit=100", { signal }),
    4000,
  );

  const allShips = useMemo(() => data?.kapal ?? [], [data]);

  const fastest = useMemo(() => {
    const withTimer = allShips.filter((k) => k.timerEndAt);
    if (withTimer.length === 0) return null;
    return withTimer.sort((a, b) => new Date(a.timerEndAt!).getTime() - new Date(b.timerEndAt!).getTime())[0];
  }, [allShips]);

  const fastestTambangan = useMemo(() => {
    if (!fastest) return null;
    return tambanganList.find((t) => t.nama === fastest.tambanganNama) ?? null;
  }, [fastest, tambanganList]);

  return (
    <section className="w-full space-y-4 px-4 py-6 md:px-6">
      {/* Fastest departure hero — PROMINENT */}
      {fastest && fastestTambangan && (
        <FastestDepartureHero ship={fastest} tambangan={fastestTambangan} />
      )}

      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight text-base-content">
          <MapPin size={14} className="text-primary" />
          Rute Tambangan
          {tambanganList.length > 0 && (
            <span className="text-base-content/50 font-normal">· {tambanganList.length}</span>
          )}
        </h2>
        <button
          onClick={refresh}
          className="btn btn-ghost btn-sm gap-1.5"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <ErrorNote message={error} />

      {loading && tambanganList.length === 0 && <SkeletonCard count={3} />}

      {!loading && !error && tambanganList.length === 0 && (
        <EmptyState title="Belum ada rute tambangan." />
      )}

      {refreshing && data && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-base-content/50">
          <RefreshCw size={12} className="animate-spin" />
          Memperbarui...
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {tambanganList.map((t) => (
          <TambanganOverviewCard key={t.slug} tambangan={t} />
        ))}
      </div>

      <Link
        href="/kapal"
        className="btn btn-primary btn-outline w-full gap-2 py-3 text-sm font-bold"
      >
        Lihat semua kapal →
      </Link>
    </section>
  );
}
