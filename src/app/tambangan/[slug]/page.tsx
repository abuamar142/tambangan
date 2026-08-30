"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { EventsTimeline, type KapalEvent } from "@/components/EventsTimeline";
import { Screen, ScreenContent } from "@/components/Screen";
import { ShareButton } from "@/components/ShareButton";
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
    <Screen>
      <ScreenHeader title={t?.nama ?? "Tambangan"} subtitle={`${list.length} kapal terdaftar`} backHref="/tambangan" />
      <ScreenContent>
        <div className="inline-flex items-center gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand)]/20 bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-brand)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:bg-[var(--color-surface-alt)] hover:shadow-[var(--shadow-md)]"
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

        {fastest && t && (
          <div className="relative overflow-hidden rounded-xl bg-[var(--color-surface)] p-5 shadow-[var(--shadow-glow-amber)] ring-1 ring-[var(--color-accent)]/15 transition-shadow hover:shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.15),transparent)]" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">Paling cepat berangkat</p>
              <p className="mt-1 text-lg font-bold text-[var(--color-text)]">{fastest.nama}</p>
              <p className="font-mono text-sm text-[var(--color-text-secondary)]">
                ~{minutesLeft(fastest.timerEndAt)} menit lagi, standby di{" "}
                {fastest.status === "titik_a" ? t.titikA.nama : t.titikB.nama}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-alt)] p-8 text-center shadow-[var(--shadow-sm)]">
            <p className="text-sm text-[var(--color-text-muted)]">Belum ada kapal di tambangan ini.</p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {groups.titik_a.length > 0 && t && <KapalGroup label={`Standby di ${t.titikA.nama}`} items={groups.titik_a} tambangan={t} />}
          {groups.titik_b.length > 0 && t && <KapalGroup label={`Standby di ${t.titikB.nama}`} items={groups.titik_b} tambangan={t} />}
        </div>
        <KapalGroup label="Sedang Menyeberang" items={groups.proses} tambangan={t} />

        <EventsTimeline
          events={events}
          loading={eventsLoading}
          title="Riwayat Terakhir"
        />
      </ScreenContent>
    </Screen>
  );
}
