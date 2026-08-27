"use client";

import { useEffect, useMemo, useState } from "react";
import { Anchor, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Screen, ScreenContent } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ChannelBar } from "@/components/ChannelBar";
import { ErrorNote } from "@/components/ErrorNote";
import { api } from "@/lib/client/api";
import { usePolling } from "@/lib/client/usePolling";
import { minutesLeft, timeAgo } from "@/lib/format";
import type { KapalMineDto, TambanganDto } from "@/lib/types";

type Filter = "all" | "titik_a" | "titik_b" | "proses";

export default function SemuaKapalPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [tambanganOpts, setTambanganOpts] = useState<TambanganDto[]>([]);

  useEffect(() => {
    api<{ tambangan: TambanganDto[] }>("/api/tambangan")
      .then((r) => setTambanganOpts(r.tambangan))
      .catch(() => {});
  }, []);

  const labelA = useMemo(() => tambanganOpts[0]?.titikA.nama ?? "Titik A", [tambanganOpts]);
  const labelB = useMemo(() => tambanganOpts[0]?.titikB.nama ?? "Titik B", [tambanganOpts]);

  const limit = 10;
  const offset = (page - 1) * limit;
  const query = `/api/kapal?limit=${limit}&offset=${offset}${filter !== "all" ? `&status=${filter}` : ""}`;

  const { data, error, loading } = usePolling<{ kapal: KapalMineDto[]; total: number }>(
    (signal) => api(query, { signal }),
    4000,
  );

  const list = data?.kapal ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Screen>
      <ScreenHeader title="Semua Kapal" subtitle={`${total} kapal terdaftar`} backHref="/" />
      <ScreenContent>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as Filter);
              setPage(1);
            }}
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
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-white dark:bg-slate-800" />
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
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {k.tambanganNama} · {k.status === "titik_a" ? labelA : k.status === "titik_b" ? labelB : "Menyeberang"}
                </p>
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ChevronLeft size={14} />
              Sebelumnya
            </button>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Hal {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Selanjutnya
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </ScreenContent>
    </Screen>
  );
}
