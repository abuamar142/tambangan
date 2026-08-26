"use client";

import { useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ErrorNote } from "@/components/ErrorNote";
import { KapalGroup } from "@/components/KapalGroup";
import { usePolling } from "@/lib/client/usePolling";
import { api } from "@/lib/client/api";
import { minutesLeft, sortByTimer } from "@/lib/format";
import type { KapalLiveDto, TambanganDto } from "@/lib/types";

interface DetailResponse {
  tambangan: TambanganDto;
  kapal: KapalLiveDto[];
}

export default function StatusTambanganPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data, error, loading, refresh } = usePolling<DetailResponse>(
    (signal) => api(`/api/tambangan/${slug}`, { signal }),
    4000,
  );

  const list = data?.kapal ?? [];
  const t = data?.tambangan;

  const groups = {
    titik_a: list.filter((k) => k.status === "titik_a").sort(sortByTimer),
    proses: list.filter((k) => k.status === "proses"),
    titik_b: list.filter((k) => k.status === "titik_b").sort(sortByTimer),
  };

  const fastest = [...groups.titik_a, ...groups.titik_b]
    .filter((k) => k.timerEndAt)
    .sort((a, b) => new Date(a.timerEndAt!).getTime() - new Date(b.timerEndAt!).getTime())[0];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-teal-50 shadow-xl dark:bg-slate-900">
      <ScreenHeader
        title={t?.nama ?? "Tambangan"}
        subtitle={`${list.length} kapal terdaftar`}
        backHref="/tambangan"
      />
      <div className="flex-1 space-y-4 p-4">
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Segarkan
        </button>

        <ErrorNote message={error} />

        {fastest && t && (
          <div className="rounded-2xl bg-amber-500 p-4 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-100">
              Paling cepat berangkat
            </p>
            <p className="mt-1 text-lg font-bold">{fastest.nama}</p>
            <p className="font-mono text-sm text-amber-50">
              ~{minutesLeft(fastest.timerEndAt)} menit lagi, standby di{" "}
              {fastest.status === "titik_a" ? t.titikA.nama : t.titikB.nama}
            </p>
          </div>
        )}

        {!loading && !error && list.length === 0 && (
          <p className="p-4 text-center text-sm text-slate-400 dark:text-slate-500">Belum ada kapal di tambangan ini.</p>
        )}

        {groups.titik_a.length > 0 && t && (
          <KapalGroup label={`Standby di ${t.titikA.nama}`} items={groups.titik_a} />
        )}
        <KapalGroup label="Sedang Menyeberang" items={groups.proses} />
        {groups.titik_b.length > 0 && t && (
          <KapalGroup label={`Standby di ${t.titikB.nama}`} items={groups.titik_b} />
        )}
      </div>
    </div>
  );
}
