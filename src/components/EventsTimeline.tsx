"use client";

import { useState } from "react";
import { ArrowRightLeft, Anchor, Clock, History, MapPin, Navigation, Pencil, Timer } from "lucide-react";
import { timeAgo } from "@/lib/format";

/* ─── Types ────────────────────────────────────────── */

export interface KapalEvent {
  id: number;
  event: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
  kapalNama?: string;
  kapalSlug?: string;
}

/* ─── Helpers ──────────────────────────────────────── */

function labelStatus(s?: string): string {
  if (s === "titik_a") return "Titik A";
  if (s === "titik_b") return "Titik B";
  if (s === "proses") return "Proses";
  return s ?? "?";
}

function renderEvent(e: KapalEvent): { label: string; detail: string; icon: React.ReactNode; color: string } {
  const m = e.meta as Record<string, string> | null;
  switch (e.event) {
    case "status":
      return {
        label: "Ubah status",
        detail: `${labelStatus(m?.from)} → ${labelStatus(m?.to)}`,
        icon: <Navigation size={13} />,
        color: "bg-info/20 text-info",
      };
    case "timer_set":
      return {
        label: "Timer diatur",
        detail: `${m?.minutes ?? "?"} menit`,
        icon: <Timer size={13} />,
        color: "bg-warning/20 text-warning",
      };
    case "timer_clear":
      return {
        label: "Timer dihapus",
        detail: "",
        icon: <Clock size={13} />,
        color: "bg-base-300 text-base-content/50",
      };
    case "set_lokasi_titik":
      return {
        label: "Lokasi GPS diatur",
        detail: `Titik ${(m?.side ?? "").toUpperCase()}`,
        icon: <MapPin size={13} />,
        color: "bg-success/20 text-success",
      };
    case "rename":
      return {
        label: "Nama diubah",
        detail: `${m?.from ?? "?"} → ${m?.to ?? "?"}`,
        icon: <Pencil size={13} />,
        color: "bg-base-300 text-base-content/50",
      };
    case "dibuat":
      return {
        label: "Kapal dibuat",
        detail: m?.oleh ? `oleh ${m.oleh}` : "",
        icon: <Anchor size={13} />,
        color: "bg-primary/20 text-primary",
      };
    case "move_tambangan":
      return {
        label: "Pindah tambangan",
        detail: `${m?.from ?? "?"} → ${m?.to ?? "?"}`,
        icon: <ArrowRightLeft size={13} />,
        color: "bg-secondary/20 text-secondary",
      };
    default:
      return {
        label: e.event,
        detail: m ? Object.entries(m).map(([k, v]) => `${k}: ${String(v)}`).join(" · ") : "",
        icon: <Clock size={13} />,
        color: "bg-base-300 text-base-content/50",
      };
  }
}

/* ─── Loading skeleton ─────────────────────────────── */

function TimelineSkeleton() {
  return (
    <div className="mt-2 space-y-2 rounded-2xl border border-base-300 bg-base-100 p-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-xl px-3 py-2.5">
          <div className="mt-0.5 h-6 w-6 animate-pulse rounded-full bg-base-300" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-base-300" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-base-300" />
          </div>
          <div className="h-3 w-12 animate-pulse rounded bg-base-300" />
        </div>
      ))}
    </div>
  );
}

/* ─── Main component ───────────────────────────────── */

export function EventsTimeline({
  events,
  loading = false,
  emptyText = "Belum ada riwayat.",
  expandable = true,
  title = "Riwayat Terakhir",
}: {
  events: KapalEvent[];
  loading?: boolean;
  emptyText?: string;
  expandable?: boolean;
  title?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isOpen = expandable ? expanded : true;

  return (
    <div>
      {expandable && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-2 rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-sm font-semibold text-base-content transition hover:bg-base-200"
          aria-expanded={expanded}
        >
          <History size={16} />
          {title}
          <span className="ml-auto text-xs text-base-content/40">{expanded ? "▲" : "▼"}</span>
        </button>
      )}
      {isOpen && (
        <div
          className={`${expandable ? "mt-2 " : ""}space-y-1 rounded-2xl border border-base-300 bg-base-100 p-3`}
          role="list"
          aria-label={title}
        >
          {loading && <TimelineSkeleton />}
          {!loading && events.length === 0 && (
            <p className="p-4 text-center text-xs text-base-content/40">{emptyText}</p>
          )}
          {events.map((e) => {
            const ev = renderEvent(e);
            return (
              <div
                key={e.id}
                role="listitem"
                className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-base-200/50"
              >
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${ev.color}`}>
                  {ev.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-base-content">
                    {e.kapalNama && e.kapalSlug && (
                      <>
                        <a href={`/nahkoda/kapal/${e.kapalSlug}`} className="hover:underline">
                          {e.kapalNama}
                        </a>
                        <span className="mx-1.5 text-base-content/30">·</span>
                      </>
                    )}
                    {ev.label}
                  </p>
                  {ev.detail && (
                    <p className="mt-0.5 text-xs text-base-content/50">{ev.detail}</p>
                  )}
                </div>
                <span className="shrink-0 font-mono text-xs text-base-content/40">
                  {timeAgo(e.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
