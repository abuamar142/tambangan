"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Screen, ScreenContent } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { KapalCard } from "@/components/KapalCard";
import { ErrorNote } from "@/components/ErrorNote";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/Skeleton";
import { api } from "@/lib/client/api";
import { usePolling } from "@/lib/client/usePolling";
import type { KapalMineDto, TambanganDto } from "@/lib/types";

type Filter = "all" | "titik_a" | "titik_b" | "proses";

export default function SemuaKapalPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [tambanganOpts, setTambanganOpts] = useState<TambanganDto[]>([]);

  useEffect(() => {
    api<{ tambangan: TambanganDto[] }>("/api/tambangan")
      .then((r) => setTambanganOpts(r.tambangan))
      .catch(() => {});
  }, []);

  const labelA = useMemo(() => tambanganOpts[0]?.titikA.nama ?? "Titik A", [tambanganOpts]);
  const labelB = useMemo(() => tambanganOpts[0]?.titikB.nama ?? "Titik B", [tambanganOpts]);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  };
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const limit = 10;
  const offset = (page - 1) * limit;
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (filter !== "all") params.set("status", filter);
  if (search) params.set("search", search);
  const query = `/api/kapal?${params}`;

  const { data, error, loading } = usePolling<{ kapal: KapalMineDto[]; total: number }>(
    (signal) => api(query, { signal }),
    4000,
  );

  const list = useMemo(() => {
    const items = data?.kapal ?? [];
    const statusOrder = { proses: 0, titik_a: 1, titik_b: 2 };
    return [...items].sort((a, b) => {
      const sa = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
      const sb = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
      return sa - sb;
    });
  }, [data]);
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

        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Cari nama kapal…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>

        <ErrorNote message={error} />

        {loading && !data && <SkeletonCard count={6} />}

        {!loading && !error && list.length === 0 && (
          <EmptyState title="Belum ada kapal untuk filter ini." />
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {list.map((k) => {
            const tambanganData = tambanganOpts.find((t) => t.nama === k.tambanganNama);
            return (
              <KapalCard
                key={k.slug}
                k={k}
                tambangan={tambanganData}
                tambanganNama={k.tambanganNama}
              />
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
