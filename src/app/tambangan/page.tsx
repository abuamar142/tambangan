"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { Screen, ScreenContent } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
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
    <Screen>
      <ScreenHeader title="Pilih Tambangan" subtitle="Lihat kapal yang siap dinaiki" backHref="/" />
      <ScreenContent>
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
              className="group block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition-shadow hover:shadow-md active:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[var(--color-text)]">{t.nama}</span>
                <ChevronRight className="shrink-0 text-[var(--color-text-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-brand)]" size={18} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                <MapPin size={13} className="shrink-0 text-[var(--color-brand)]" />
                <span>
                  {t.titikA.nama} ↔ {t.titikB.nama}
                </span>
                {typeof t.jumlahKapal === "number" && (
                  <span className="ml-auto inline-flex items-center rounded-full bg-[var(--color-brand-50)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--color-brand-700)]">
                    {t.jumlahKapal} kapal
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </ScreenContent>
    </Screen>
  );
}
