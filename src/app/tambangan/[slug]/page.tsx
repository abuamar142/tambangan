"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { EventsTimeline, type KapalEvent } from "@/components/EventsTimeline";
import { FastestDepartureHero } from "@/components/FastestDepartureHero";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ShareButton } from "@/components/ShareButton";
import { ErrorNote } from "@/components/ErrorNote";
import { KapalGroup } from "@/components/KapalGroup";
import { usePolling } from "@/lib/client/usePolling";
import { api } from "@/lib/client/api";
import { sortByTimer } from "@/lib/format";
import type { KapalLiveDto, TambanganDto } from "@/lib/types";

interface DetailResponse {
  tambangan: TambanganDto;
  kapal: KapalLiveDto[];
}

export default function StatusTambanganPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params.slug;

  // Read initial filter from URL (?filter=titik_a, titik_b, proses, or all)
  const initialFilter = searchParams.get("filter") as "titik_a" | "titik_b" | "proses" | "all" | null;
  const [filter, setFilter] = useState<"all" | "titik_a" | "proses" | "titik_b">(
    initialFilter && ["titik_a", "proses", "titik_b"].includes(initialFilter) ? initialFilter : "all"
  );

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

  // Filtered groups based on active filter
  const showTitikA = filter === "all" || filter === "titik_a";
  const showProses = filter === "all" || filter === "proses";
  const showTitikB = filter === "all" || filter === "titik_b";

  const fastest = [...groups.titik_a, ...groups.titik_b]
    .filter((k) => k.timerEndAt)
    .sort((a, b) => new Date(a.timerEndAt!).getTime() - new Date(b.timerEndAt!).getTime())[0];

  const [events, setEvents] = useState<KapalEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api<{ events: KapalEvent[] }>(`/api/tambangan/${slug}/events`)
      .then((r) => { if (alive) setEvents(r.events); })
      .catch(() => {})
      .finally(() => { if (alive) setEventsLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  return (
    <div className="space-y-4">
      <ScreenHeader title={t?.nama ?? "Tambangan"} subtitle={`${list.length} kapal terdaftar`} backHref="/tambangan" />
        <div className="inline-flex items-center gap-2">
          <button
            onClick={refresh}
            className="btn btn-ghost btn-sm border border-primary/20"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Segarkan
          </button>
          {t && (
            <ShareButton
              title={`Status ${t.nama}`}
              text={`Status ${t.nama}: ${list.length} kapal`}
            />
          )}
        </div>

        <ErrorNote message={error} />

        {/* Quick filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            { value: "all", label: "Semua" },
            { value: "titik_a", label: t?.titikA.nama ?? "Titik A" },
            { value: "proses", label: "Menyeberang" },
            { value: "titik_b", label: t?.titikB.nama ?? "Titik B" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`btn btn-sm shrink-0 ${
                filter === opt.value
                  ? "btn-primary"
                  : "btn-ghost border border-base-300"
              }`}
            >
              {opt.label}
              {opt.value !== "all" && (
                <span className="ml-1 text-[10px] opacity-70">
                  {opt.value === "titik_a" && groups.titik_a.length}
                  {opt.value === "proses" && groups.proses.length}
                  {opt.value === "titik_b" && groups.titik_b.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {fastest && t && (
          <FastestDepartureHero ship={fastest} tambangan={t} />
        )}

        {!loading && !error && list.length === 0 && (
          <div className="border border-dashed border-base-300 bg-base-200 p-8 text-center shadow-sm rounded-xl">
            <p className="text-sm text-base-content/50">Belum ada kapal di tambangan ini.</p>
          </div>
        )}

        {showTitikA && groups.titik_a.length > 0 && t && <KapalGroup label={`Standby di ${t.titikA.nama}`} items={groups.titik_a} tambangan={t} />}
        {showTitikB && groups.titik_b.length > 0 && t && <KapalGroup label={`Standby di ${t.titikB.nama}`} items={groups.titik_b} tambangan={t} />}
        {showProses && <KapalGroup label="Sedang Menyeberang" items={groups.proses} tambangan={t} />}

        <EventsTimeline
          events={events}
          loading={eventsLoading}
          title="Riwayat Terakhir"
        />
      </div>
  );
}
