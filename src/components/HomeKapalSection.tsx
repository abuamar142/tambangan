"use client";

import Link from "next/link";
import { Anchor, ChevronDown, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ChannelBar } from "./ChannelBar";
import { ErrorNote } from "./ErrorNote";
import { api } from "@/lib/client/api";
import { usePolling } from "@/lib/client/usePolling";
import { minutesLeft, timeAgo } from "@/lib/format";
import type { KapalMineDto, TambanganDto } from "@/lib/types";

type Filter = "all" | "titik_a" | "titik_b" | "proses";

export function HomeKapalSection() {
  const [filter, setFilter] = useState<Filter>("all");
  const [tambanganOpts, setTambanganOpts] = useState<TambanganDto[]>([]);

  useEffect(() => {
    api<{ tambangan: TambanganDto[] }>("/api/tambangan")
      .then((r) => setTambanganOpts(r.tambangan))
      .catch(() => {});
  }, []);

  const labelA = useMemo(() => tambanganOpts[0]?.titikA.nama ?? "Titik A", [tambanganOpts]);
  const labelB = useMemo(() => tambanganOpts[0]?.titikB.nama ?? "Titik B", [tambanganOpts]);

  const query = `/api/kapal?limit=5${filter !== "all" ? `&status=${filter}` : ""}`;
  const { data, error, loading, refresh } = usePolling<{ kapal: KapalMineDto[]; total: number }>(
    (signal) => api(query, { signal }),
    4000,
  );

  const list = data?.kapal ?? [];

  return (
    <section className="w-full space-y-3 px-4 py-6 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">Kapal Terbaru</h2>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50 dark:border-slate-600 dark:bg-slate-800 dark:text-teal-400"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Segarkan
        </button>
      </div>

      <div className="relative">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          aria-label="Filter kapal"
        >
          <option value="all">Semua</option>
          <option value="titik_a">Standby di {labelA}</option>
          <option value="titik_b">Standby di {labelB}</option>
          <option value="proses">Sedang Menyeberang</option>
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        />
      </div>

      <ErrorNote message={error} />

      {loading && !data && (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white dark:bg-slate-800" />
          ))}
        </div>
      )}

      {!loading && !error && list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-teal-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada kapal untuk filter ini.</p>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {list.map((k) => {
          const mins = minutesLeft(k.timerEndAt);
          return (
            <div
              key={k.slug}
              className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                    <Anchor size={13} />
                  </span>
                  {k.nama}
                </span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{timeAgo(k.lastUpdated)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{k.tambanganNama}</p>
              <div className="mt-2.5">
                <ChannelBar status={k.status} compact />
              </div>
              {mins !== null && (
                <p className="mt-2 font-mono text-xs font-semibold text-amber-700 dark:text-amber-400">~{mins} menit lagi</p>
              )}
            </div>
          );
        })}
      </div>

      <Link
        href="/kapal"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white py-3 text-sm font-bold text-teal-700 shadow-sm transition hover:bg-teal-50 active:bg-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-teal-400 dark:hover:bg-slate-700"
      >
        Lihat semua kapal →
      </Link>
    </section>
  );
}
