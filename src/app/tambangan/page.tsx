"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ErrorNote } from "@/components/ErrorNote";
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
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-teal-50 shadow-xl">
      <ScreenHeader title="Pilih Tambangan" subtitle="Lihat kapal yang siap dinaiki" backHref="/" />
      <div className="flex-1 space-y-3 p-4">
        <ErrorNote message={error} />
        {loading && !data && (
          <p className="p-4 text-center text-sm text-slate-400">Memuat…</p>
        )}
        {!loading && !error && list.length === 0 && (
          <p className="p-4 text-center text-sm text-slate-400">Belum ada tambangan terdaftar.</p>
        )}
        {list.map((t) => (
          <Link
            key={t.slug}
            href={`/tambangan/${t.slug}`}
            className="block rounded-xl border border-teal-100 bg-white p-4 shadow-sm active:bg-teal-50"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900">{t.nama}</span>
              <ChevronRight className="shrink-0 text-slate-300" size={18} />
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin size={13} className="shrink-0 text-teal-600" />
              {t.titikA.nama} ↔ {t.titikB.nama}
              {typeof t.jumlahKapal === "number" && (
                <span className="ml-auto font-mono">{t.jumlahKapal} kapal</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
