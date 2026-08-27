"use client";

import Link from "next/link";
import { ChevronDown, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { KapalCard } from "./KapalCard";
import { ErrorNote } from "./ErrorNote";
import { EmptyState } from "./EmptyState";
import { SkeletonCard } from "./Skeleton";
import { api } from "@/lib/client/api";
import { usePolling } from "@/lib/client/usePolling";
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
        <h2 className="text-sm font-bold tracking-tight text-[var(--color-text)]">Kapal Terbaru</h2>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-700)] shadow-sm transition hover:bg-[var(--color-brand-50)] dark:text-[var(--color-brand-500)]"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Segarkan
        </button>
      </div>

      <div className="relative">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 pr-10 text-sm font-medium text-[var(--color-text-secondary)] shadow-sm outline-none transition focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
          aria-label="Filter kapal"
        >
          <option value="all">Semua</option>
          <option value="titik_a">Standby di {labelA}</option>
          <option value="titik_b">Standby di {labelB}</option>
          <option value="proses">Sedang Menyeberang</option>
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
      </div>

      <ErrorNote message={error} />

      {loading && !data && <SkeletonCard count={5} />}

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

      <Link
        href="/kapal"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 text-sm font-bold text-[var(--color-brand-700)] shadow-sm transition hover:bg-[var(--color-brand-50)] active:bg-[var(--color-brand-100)] dark:text-[var(--color-brand-500)] dark:hover:bg-[var(--color-surface-alt)]"
      >
        Lihat semua kapal →
      </Link>
    </section>
  );
}
