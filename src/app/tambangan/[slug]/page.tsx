"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Anchor, ArrowRightLeft, Clock, History, MapPin, Navigation, Pencil, RefreshCw, Timer } from "lucide-react";
import { Screen, ScreenContent } from "@/components/Screen";
import { ShareButton } from "@/components/ShareButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ErrorNote } from "@/components/ErrorNote";
import { KapalGroup } from "@/components/KapalGroup";
import { usePolling } from "@/lib/client/usePolling";
import { api } from "@/lib/client/api";
import { minutesLeft, sortByTimer, timeAgo } from "@/lib/format";
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
    <Screen>
      <ScreenHeader title={t?.nama ?? "Tambangan"} subtitle={`${list.length} kapal terdaftar`} backHref="/tambangan" />
      <ScreenContent>
        <div className="inline-flex items-center gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50 dark:border-slate-600 dark:bg-slate-800 dark:text-teal-400 dark:hover:bg-slate-700"
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
          <div className="rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 p-5 text-white shadow-lg ring-1 ring-amber-500/20">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-100">Paling cepat berangkat</p>
            <p className="mt-1 text-lg font-bold">{fastest.nama}</p>
            <p className="font-mono text-sm text-amber-50">
              ~{minutesLeft(fastest.timerEndAt)} menit lagi, standby di{" "}
              {fastest.status === "titik_a" ? t.titikA.nama : t.titikB.nama}
            </p>
          </div>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-teal-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada kapal di tambangan ini.</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {groups.titik_a.length > 0 && t && <KapalGroup label={`Standby di ${t.titikA.nama}`} items={groups.titik_a} tambangan={t} />}
          {groups.titik_b.length > 0 && t && <KapalGroup label={`Standby di ${t.titikB.nama}`} items={groups.titik_b} tambangan={t} />}
        </div>
        <KapalGroup label="Sedang Menyeberang" items={groups.proses} tambangan={t} />

        <EventsTimeline slug={slug} />
      </ScreenContent>
    </Screen>
  );
}

/* ─── Events Timeline ──────────────────────────────── */

interface EventItem {
  id: number;
  event: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
  kapalNama: string;
  kapalSlug: string;
}

function renderEvent(e: EventItem): { label: string; detail: string; icon: React.ReactNode; color: string } {
  const m = e.meta as Record<string, string> | null;
  switch (e.event) {
    case "status":
      return {
        label: "Ubah status",
        detail: `${labelStatus(m?.from)} → ${labelStatus(m?.to)}`,
        icon: <Navigation size={13} />,
        color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
      };
    case "timer_set":
      return {
        label: "Timer diatur",
        detail: `${m?.minutes ?? "?"} menit`,
        icon: <Timer size={13} />,
        color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
      };
    case "timer_clear":
      return {
        label: "Timer dihapus",
        detail: "",
        icon: <Clock size={13} />,
        color: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
      };
    case "set_lokasi_titik":
      return {
        label: "Lokasi GPS diatur",
        detail: `Titik ${(m?.side ?? "").toUpperCase()}`,
        icon: <MapPin size={13} />,
        color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
      };
    case "rename":
      return {
        label: "Nama diubah",
        detail: `${m?.from ?? "?"} → ${m?.to ?? "?"}`,
        icon: <Pencil size={13} />,
        color: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
      };
    case "dibuat":
      return {
        label: "Kapal dibuat",
        detail: m?.oleh ? `oleh ${m.oloh}` : "",
        icon: <Anchor size={13} />,
        color: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400",
      };
    case "move_tambangan":
      return {
        label: "Pindah tambangan",
        detail: `${m?.from ?? "?"} → ${m?.to ?? "?"}`,
        icon: <ArrowRightLeft size={13} />,
        color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
      };
    default:
      return {
        label: e.event,
        detail: m ? Object.entries(m).map(([k, v]) => `${k}: ${String(v)}`).join(" · ") : "",
        icon: <Clock size={13} />,
        color: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
      };
  }
}

function labelStatus(s?: string): string {
  if (s === "titik_a") return "Titik A";
  if (s === "titik_b") return "Titik B";
  if (s === "proses") return "Proses";
  return s ?? "?";
}

function EventsTimeline({ slug }: { slug: string }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    let alive = true;
    api<{ events: EventItem[] }>(`/api/tambangan/${slug}/events`)
      .then((r) => { if (alive) setEvents(r.events); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [expanded, slug]);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <History size={16} />
        Riwayat Terakhir
        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-1 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          {loading && (
            <p className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">Memuat riwayat…</p>
          )}
          {!loading && events.length === 0 && (
            <p className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">Belum ada riwayat.</p>
          )}
          {events.map((e) => {
            const ev = renderEvent(e);
            return (
              <div key={e.id} className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${ev.color}`}>
                  {ev.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    <a href={`/nahkoda/kapal/${e.kapalSlug}`} className="hover:underline">{e.kapalNama}</a>
                    <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
                    {ev.label}
                  </p>
                  {ev.detail && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{ev.detail}</p>
                  )}
                </div>
                <span className="shrink-0 font-mono text-xs text-slate-400 dark:text-slate-500">{timeAgo(e.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
