"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { ErrorNote } from "@/components/ErrorNote";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/Skeleton";
import { usePolling } from "@/lib/client/usePolling";
import { api } from "@/lib/client/api";
import type { TambanganDto } from "@/lib/types";

export default function PilihTambanganPage() {
  const { data, error, loading } = usePolling<{ tambangan: TambanganDto[] }>(
    (signal) => api("/api/tambangan", { signal }),
    8000,
  );

  const list = data?.tambangan ?? [];

  return (
    <div className="space-y-4">
      <ErrorNote message={error} />
        {loading && !data && <SkeletonCard count={4} />}
        {!loading && !error && list.length === 0 && (
          <EmptyState title="Belum ada tambangan terdaftar." />
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((t) => (
            <Link
              key={t.slug}
              href={`/tambangan/${t.slug}`}
              className="group block animate-card-in border border-base-300 bg-base-100 p-4 shadow-sm transition-shadow hover:shadow-md active:shadow-sm rounded-xl"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-base-content">{t.nama}</span>
                <ChevronRight className="shrink-0 text-base-content/50 transition group-hover:translate-x-0.5 group-hover:text-primary" size={18} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-base-content/70">
                <MapPin size={13} className="shrink-0 text-primary" />
                <span>
                  {t.titikA.nama} ↔ {t.titikB.nama}
                </span>
                {typeof t.jumlahKapal === "number" && (
                  <span className="ml-auto inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                    {t.jumlahKapal} kapal
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
    </div>
  );
}
