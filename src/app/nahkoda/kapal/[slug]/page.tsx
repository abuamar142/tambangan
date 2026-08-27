"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, Crosshair, History, Pencil, Trash2 } from "lucide-react";
import { Screen, ScreenContent } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ErrorNote } from "@/components/ErrorNote";
import { StatusBadge } from "@/components/StatusBadge";
import { ChannelBar } from "@/components/ChannelBar";
import { api } from "@/lib/client/api";
import { usePolling } from "@/lib/client/usePolling";
import { formatDistance, getPosition, haversineMeters } from "@/lib/geo";
import { minutesLeft, timeAgo } from "@/lib/format";
import { useCountdown } from "@/lib/client/useCountdown";
import type { KapalMineDto } from "@/lib/types";

const NEAR_M = 120;
const FAR_M = 250;

type StateAction =
  | { action: "status"; value: "titik_a" | "proses" | "titik_b" }
  | { action: "timer"; minutes: number }
  | { action: "timer_clear" }
  | { action: "set_lokasi_titik"; side: "a" | "b"; lat: number; lng: number };

export default function KontrolKapalPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [mode, setMode] = useState<"manual" | "gps">("manual");
  const [timerInput, setTimerInput] = useState("");
  const [gpsDist, setGpsDist] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });
  const [gpsError, setGpsError] = useState("");
  const [actionError, setActionError] = useState("");
  const [gettingLoc, setGettingLoc] = useState<"a" | "b" | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const { data, error, loading, refresh } = usePolling<{ kapal: KapalMineDto }>(
    (signal) => api(`/api/kapal/${slug}`, { signal }),
    5000,
  );

  const k = data?.kapal;
  const dataRef = useRef<KapalMineDto | null>(null);
  const gpsDistRef = useRef(gpsDist);

  useEffect(() => {
    dataRef.current = k ?? null;
  }, [k]);

  useEffect(() => {
    gpsDistRef.current = gpsDist;
  }, [gpsDist]);

  const patch = useCallback(
    async (body: StateAction) => {
      setActionError("");
      try {
        await api(`/api/kapal/${slug}`, { method: "PATCH", body: JSON.stringify(body) });
        refresh();
      } catch (e) {
        setActionError((e as Error).message);
      }
    },
    [slug, refresh],
  );

  const measure = useCallback(async (): Promise<boolean> => {
    const cur = dataRef.current;
    if (!cur) return false;
    try {
      const pos = await getPosition();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const a =
        cur.titikA.lat !== null && cur.titikA.lng !== null
          ? haversineMeters(lat, lng, cur.titikA.lat, cur.titikA.lng)
          : null;
      const b =
        cur.titikB.lat !== null && cur.titikB.lng !== null
          ? haversineMeters(lat, lng, cur.titikB.lat, cur.titikB.lng)
          : null;
      if (dataRef.current === cur) {
        setGpsDist({ a, b });
        setGpsError("");
      }
      return true;
    } catch (e) {
      setGpsError((e as Error).message ?? "GPS gagal");
      return false;
    }
  }, []);

  const captureTitik = useCallback(
    async (side: "a" | "b") => {
      setGettingLoc(side);
      setGpsError("");
      try {
        const pos = await getPosition();
        await patch({
          action: "set_lokasi_titik",
          side,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      } catch (e) {
        setGpsError((e as Error).message ?? "GPS gagal");
      } finally {
        setGettingLoc(null);
      }
    },
    [patch],
  );

  const handleRename = useCallback(async () => {
    if (!editName.trim() || editName.trim() === k?.nama) {
      setEditing(false);
      return;
    }
    setActionError("");
    try {
      await api(`/api/kapal/${slug}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "rename", nama: editName.trim() }),
      });
      setEditing(false);
      refresh();
    } catch (e) {
      setActionError((e as Error).message);
    }
  }, [editName, slug, k, refresh]);

  const handleDelete = useCallback(async () => {
    if (!confirm(`Hapus kapal "${k?.nama}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setActionError("");
    try {
      await api(`/api/kapal/${slug}`, { method: "DELETE" });
      window.location.href = "/nahkoda";
    } catch (e) {
      setActionError((e as Error).message);
    }
  }, [slug, k, refresh]);

  useEffect(() => {
    if (mode !== "gps") return;

    let alive = true;
    let inFlight = false;

    async function tick() {
      if (inFlight) return;
      inFlight = true;
      try {
        const okMeasure = await measure();
        const cur = dataRef.current;
        if (!alive || !okMeasure || !cur || mode !== "gps") return;
        const a = gpsDistRef.current.a;
        const b = gpsDistRef.current.b;
        const nearA = a !== null && a <= NEAR_M;
        const nearB = b !== null && b <= NEAR_M;
        const farFromBoth =
          (a === null || a >= FAR_M) && (b === null || b >= FAR_M) && (a !== null || b !== null);
        if (nearA && cur.status !== "titik_a") {
          await patch({ action: "status", value: "titik_a" });
        } else if (nearB && cur.status !== "titik_b") {
          await patch({ action: "status", value: "titik_b" });
        } else if (farFromBoth && cur.status !== "proses") {
          await patch({ action: "status", value: "proses" });
        }
      } finally {
        inFlight = false;
      }
    }

    tick();
    const id = setInterval(tick, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [mode, measure, patch]);

  const countdown = useCountdown(k?.timerEndAt ?? null);

  if (loading && !data) {
    return (
      <Screen>
        <ScreenHeader title="Memuat…" backHref="/nahkoda" />
        <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Mengambil data kapal…</p>
      </Screen>
    );
  }

  if (!k) {
    return (
      <Screen>
        <ScreenHeader title="Kapal" backHref="/nahkoda" />
        <ScreenContent>
          <ErrorNote message={error || "Kapal tidak ditemukan atau bukan milik Anda"} />
        </ScreenContent>
      </Screen>
    );
  }

  const mins = minutesLeft(k?.timerEndAt ?? null);
  const showTimer = k && (k.status === "titik_a" || k.status === "titik_b");

  return (
    <Screen>
      <ScreenHeader title="" backHref="/nahkoda" />
      <ScreenContent>
        {editing ? (
          <div className="flex items-center gap-2 rounded-2xl border border-teal-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleRename(); if (e.key === "Escape") setEditing(false); }}
              autoFocus
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
            <button onClick={() => void handleRename()} className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700">Simpan</button>
            <button onClick={() => setEditing(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300">Batal</button>
          </div>
        ) : (
          <button
            onClick={() => { setEditing(true); setEditName(k?.nama ?? ""); }}
            className="flex w-full items-center justify-between rounded-2xl border border-teal-100 bg-white px-4 py-3 text-left shadow-sm hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">{k?.nama}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{k?.tambanganNama}</p>
            </div>
            <Pencil size={14} className="text-slate-400 dark:text-slate-500" />
          </button>
        )}

        <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={k.status} departingFrom={k.departingFrom} titikA={k.titikA} titikB={k.titikB} />
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{timeAgo(k.lastUpdated)}</span>
          </div>
          <div className="mt-4">
            <ChannelBar status={k.status} departingFrom={k.departingFrom} />
            <div className="mt-2 flex justify-between font-mono text-xs text-slate-500 dark:text-slate-400">
              <span>{k.titikA.nama}</span>
              <span>{k.titikB.nama}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => void handleDelete()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 active:bg-red-200 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          <Trash2 size={14} />
          Hapus Kapal
        </button>

        <ErrorNote message={actionError} />

        <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex gap-1">
            <button
              onClick={() => setMode("manual")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                mode !== "gps"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setMode("gps")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                mode === "gps"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              GPS Otomatis
            </button>
          </div>

          {mode !== "gps" ? (
            <div className="grid grid-cols-3 gap-2 p-2">
              <button
                onClick={() => void patch({ action: "status", value: "titik_a" })}
                className={`min-h-11 rounded-xl py-3 text-xs font-bold transition ${
                  k.status === "titik_a"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {k.titikA.nama}
              </button>
              <button
                onClick={() => void patch({ action: "status", value: "proses" })}
                className={`min-h-11 rounded-xl py-3 text-xs font-bold transition ${
                  k.status === "proses"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                Proses ⛵
              </button>
              <button
                onClick={() => void patch({ action: "status", value: "titik_b" })}
                className={`min-h-11 rounded-xl py-3 text-xs font-bold transition ${
                  k.status === "titik_b"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {k.titikB.nama}
              </button>
            </div>
          ) : (
            <div className="space-y-3 p-3">
              {gpsError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">{gpsError}</p>}
              <div className="space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                <p className="flex items-center justify-between font-mono text-xs text-slate-600 dark:text-slate-400">
                  <span>{k.titikA.nama}</span>
                  <span className="font-semibold">{formatDistance(gpsDist.a)}</span>
                </p>
                <p className="flex items-center justify-between font-mono text-xs text-slate-600 dark:text-slate-400">
                  <span>{k.titikB.nama}</span>
                  <span className="font-semibold">{formatDistance(gpsDist.b)}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {k.titikA.lat === null && (
                  <button
                    onClick={() => void captureTitik("a")}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-teal-50 py-2.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300"
                  >
                    <Crosshair size={12} />
                    {gettingLoc === "a" ? "Mengambil…" : `Set lokasi ${k.titikA.nama}`}
                  </button>
                )}
                {k.titikB.lat === null && (
                  <button
                    onClick={() => void captureTitik("b")}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-teal-50 py-2.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300"
                  >
                    <Crosshair size={12} />
                    {gettingLoc === "b" ? "Mengambil…" : `Set lokasi ${k.titikB.nama}`}
                  </button>
                )}
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Status terupdate otomatis dari GPS. Kalau sinyal lemah, pakai mode manual saja.
              </p>
            </div>
          )}
        </div>

        {showTimer && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
              <Clock size={16} />
              Estimasi berangkat lagi
            </div>
            {mins !== null ? (
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-amber-800 dark:text-amber-300">
                  {countdown ? countdown.display : `${mins}m`}
                </span>
                <button
                  onClick={() => void patch({ action: "timer_clear" })}
                  className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-amber-700 shadow-sm ring-1 ring-amber-200 transition hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-300 dark:ring-amber-800"
                >
                  Hapus Timer
                </button>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex gap-1.5">
                  {[5, 10, 15].map((m) => (
                    <button
                      key={m}
                      onClick={() => void patch({ action: "timer", minutes: m })}
                      className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-amber-800 shadow-sm ring-1 ring-amber-200 transition hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-300 dark:ring-amber-800"
                    >
                      {m}m
                    </button>
                  ))}
                </div>
                <input
                  value={timerInput}
                  onChange={(e) => setTimerInput(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="lainnya"
                  inputMode="numeric"
                  className="w-16 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-800 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  onClick={() => {
                    const m = parseInt(timerInput, 10);
                    if (m > 0) void patch({ action: "timer", minutes: m });
                    setTimerInput("");
                  }}
                  disabled={!timerInput}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            )}
          </div>
        )}

        {/* Riwayat Perjalanan */}
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
}

const eventLabels: Record<string, string> = {
  status: "Ubah status",
  timer_set: "Timer diatur",
  timer_clear: "Timer dihapus",
  set_lokasi_titik: "Lokasi GPS diatur",
  rename: "Nama diubah",
  dihapus: "Kapal dihapus",
  move_tambangan: "Pindah tambangan",
};

function EventsTimeline({ slug }: { slug: string }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    let alive = true;
    api<{ events: EventItem[] }>(`/api/kapal/${slug}/events`)
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
        Riwayat Perjalanan
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
          {events.map((e) => (
            <div key={e.id} className="flex items-start gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-500 dark:bg-teal-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {eventLabels[e.event] ?? e.event}
                </p>
                {e.meta && typeof e.meta === "object" && (
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {Object.entries(e.meta)
                      .map(([k, v]) => `${k}: ${String(v)}`)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <span className="shrink-0 font-mono text-xs text-slate-400 dark:text-slate-500">{timeAgo(e.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
