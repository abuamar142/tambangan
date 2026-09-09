"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRightLeft, Clock, Crosshair, Pencil, Trash2 } from "lucide-react";
import { EventsTimeline, type KapalEvent } from "@/components/EventsTimeline";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ErrorNote } from "@/components/ErrorNote";
import { StatusBadge } from "@/components/StatusBadge";
import { ChannelBar } from "@/components/ChannelBar";
import { api } from "@/lib/client/api";
import { usePolling } from "@/lib/client/usePolling";
import { formatDistance, getPosition, haversineMeters } from "@/lib/geo";
import { minutesLeft, timeAgo } from "@/lib/format";
import { useCountdown } from "@/lib/client/useCountdown";
import type { KapalMineDto, TambanganDto } from "@/lib/types";

const NEAR_M = 120;
const FAR_M = 250;

type StateAction =
  | { action: "status"; value: "titik_a" | "proses" | "titik_b" }
  | { action: "timer"; minutes: number }
  | { action: "timer_clear" }
  | { action: "set_lokasi_titik"; side: "a" | "b"; lat: number; lng: number }
  | { action: "rename"; nama: string }
  | { action: "move_tambangan"; tambanganSlug: string };

export default function KontrolKapalPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();

  const [mode, setMode] = useState<"manual" | "gps">("manual");
  const [timerInput, setTimerInput] = useState("");
  const [gpsDist, setGpsDist] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });
  const [gpsError, setGpsError] = useState("");
  const [actionError, setActionError] = useState("");
  const [gettingLoc, setGettingLoc] = useState<"a" | "b" | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [tambanganList, setTambanganList] = useState<TambanganDto[]>([]);

  useEffect(() => {
    api<{ tambangan: TambanganDto[] }>("/api/tambangan")
      .then((r) => setTambanganList(r.tambangan))
      .catch(() => {});
  }, []);

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
      router.push("/nahkoda");
    } catch (e) {
      setActionError((e as Error).message);
    }
  }, [slug, k, router]);

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

  const [events, setEvents] = useState<KapalEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    if (!k) return;
    let alive = true;
    api<{ events: KapalEvent[] }>(`/api/kapal/${slug}/events`)
      .then((r) => { if (alive) setEvents(r.events); })
      .catch(() => {})
      .finally(() => { if (alive) setEventsLoading(false); });
    return () => { alive = false; };
  }, [slug, k]);

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <ScreenHeader title="Memuat…" backHref="/nahkoda" />
        <p className="p-8 text-center text-sm text-base-content/50">Mengambil data kapal…</p>
      </div>
    );
  }

  if (!k) {
    return (
      <div className="space-y-4">
        <ScreenHeader title="Kapal" backHref="/nahkoda" />
        <ErrorNote message={error || "Kapal tidak ditemukan atau bukan milik Anda"} />
      </div>
    );
  }

  const mins = minutesLeft(k?.timerEndAt ?? null);
  const showTimer = k && (k.status === "titik_a" || k.status === "titik_b");

  return (
    <div className="space-y-4">
      <ScreenHeader title={k?.nama ?? "Kontrol Kapal"} backHref="/nahkoda" />
        {/* Edit name card */}
        {editing ? (
          <div className="flex items-center gap-2 border border-primary/20 bg-base-100 p-3 shadow-md rounded-xl">
            <label htmlFor="edit-nama-kapal" className="sr-only">
              Nama kapal
            </label>
            <input
              id="edit-nama-kapal"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleRename(); if (e.key === "Escape") setEditing(false); }}
              autoFocus
              className="input input-bordered min-w-0 flex-1 text-sm font-bold"
            />
            <button onClick={() => void handleRename()} className="btn btn-primary btn-sm">Simpan</button>
            <button onClick={() => setEditing(false)} className="btn btn-ghost btn-sm">Batal</button>
          </div>
        ) : (
          <button
            onClick={() => { setEditing(true); setEditName(k?.nama ?? ""); }}
            className="flex w-full items-center justify-between border border-base-300 bg-base-100 px-4 py-3 text-left shadow-sm transition-all duration-200 hover:shadow-md rounded-xl"
          >
            <div>
              <p className="font-bold text-base-content">{k?.nama}</p>
              <p className="text-xs text-base-content/50">{k?.tambanganNama}</p>
            </div>
            <Pencil size={14} className="text-base-content/50" />
          </button>
        )}

        {/* Status card */}
        <div className="border border-base-300 bg-base-100 p-5 shadow-sm transition-shadow hover:shadow-md rounded-xl">
          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={k.status} departingFrom={k.departingFrom} titikA={k.titikA} titikB={k.titikB} />
            <span className="font-mono text-xs text-base-content/50">{timeAgo(k.lastUpdated)}</span>
          </div>
          <div className="mt-4">
            <ChannelBar status={k.status} departingFrom={k.departingFrom} />
            <div className="mt-2 flex justify-between font-mono text-xs text-base-content/50">
              <span>{k.titikA.nama}</span>
              <span>{k.titikB.nama}</span>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => void handleDelete()}
          className="btn btn-error btn-outline w-full"
        >
          <Trash2 size={14} />
          Hapus Kapal
        </button>

        {/* Pindah Tambangan */}
        {tambanganList.length > 1 && (
          <div className="border border-base-300 bg-base-100 p-4 shadow-sm transition-shadow hover:shadow-md rounded-xl">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-base-content/70">
              <ArrowRightLeft size={13} />
              Pindah Tambangan
            </p>
            <p className="mb-2 text-xs text-base-content/50">Sekarang: {k?.tambanganNama}</p>
            <label htmlFor="pindah-tambangan" className="sr-only">
              Pilih tambangan tujuan
            </label>
            <select
              id="pindah-tambangan"
              onChange={(e) => {
                if (e.target.value && e.target.value !== k?.tambanganSlug) {
                  if (confirm(`Pindah kapal ke tambangan ini? Status akan direset ke titik awal.`)) {
                    void patch({ action: "move_tambangan", tambanganSlug: e.target.value });
                  }
                }
                e.target.value = "";
              }}
              defaultValue=""
              className="select select-bordered w-full text-sm font-medium"
            >
              <option value="">Pilih tambangan tujuan…</option>
              {tambanganList
                .filter((t) => t.slug !== k?.tambanganSlug)
                .map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.nama}
                  </option>
                ))}
            </select>
          </div>
        )}

        <ErrorNote message={actionError} />

        <div className="grid gap-4 lg:grid-cols-2">
        {/* Mode toggle (Manual / GPS) */}
        <div className="border border-base-300 bg-base-100 p-1 shadow-sm rounded-xl">
          <div className="flex gap-1">
            <button
              onClick={() => setMode("manual")}
              aria-pressed={mode === "manual"}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl ${
                mode === "manual"
                  ? "btn btn-primary"
                  : "text-base-content/70 hover:bg-base-200"
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setMode("gps")}
              aria-pressed={mode === "gps"}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl ${
                mode === "gps"
                  ? "btn btn-primary"
                  : "text-base-content/70 hover:bg-base-200"
              }`}
            >
              GPS Otomatis
            </button>
          </div>

          {mode !== "gps" ? (
            /* Manual status buttons grid */
            <div className="grid grid-cols-3 gap-2 p-2">
              <button
                onClick={() => void patch({ action: "status", value: "titik_a" })}
                className={`min-h-11 py-3 text-xs font-bold transition-all duration-200 rounded-xl ${
                  k.status === "titik_a"
                    ? "btn btn-success"
                    : "border border-base-300 bg-base-200 text-base-content hover:bg-base-300"
                }`}
              >
                {k.titikA.nama}
              </button>
              <button
                onClick={() => void patch({ action: "status", value: "proses" })}
                className={`min-h-11 py-3 text-xs font-bold transition-all duration-200 rounded-xl ${
                  k.status === "proses"
                    ? "btn btn-info"
                    : "border border-base-300 bg-base-200 text-base-content hover:bg-base-300"
                }`}
              >
                Proses
              </button>
              <button
                onClick={() => void patch({ action: "status", value: "titik_b" })}
                className={`min-h-11 py-3 text-xs font-bold transition-all duration-200 rounded-xl ${
                  k.status === "titik_b"
                    ? "btn btn-success"
                    : "border border-base-300 bg-base-200 text-base-content hover:bg-base-300"
                }`}
              >
                {k.titikB.nama}
              </button>
            </div>
          ) : (
            /* GPS mode */
            <div className="space-y-3 p-3">
              {gpsError && <p className="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">{gpsError}</p>}
              <div className="space-y-2 bg-base-200 p-3 shadow-sm rounded-xl">
                <p className="flex items-center justify-between font-mono text-xs text-base-content/70">
                  <span>{k.titikA.nama}</span>
                  <span className="font-semibold text-base-content">{formatDistance(gpsDist.a)}</span>
                </p>
                <p className="flex items-center justify-between font-mono text-xs text-base-content/70">
                  <span>{k.titikB.nama}</span>
                  <span className="font-semibold text-base-content">{formatDistance(gpsDist.b)}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {k.titikA.lat === null && (
                  <button
                    onClick={() => void captureTitik("a")}
                    className="btn btn-primary/10 text-primary btn-sm flex-1"
                  >
                    <Crosshair size={12} />
                    {gettingLoc === "a" ? "Mengambil…" : `Set lokasi ${k.titikA.nama}`}
                  </button>
                )}
                {k.titikB.lat === null && (
                  <button
                    onClick={() => void captureTitik("b")}
                    className="btn btn-primary/10 text-primary btn-sm flex-1"
                  >
                    <Crosshair size={12} />
                    {gettingLoc === "b" ? "Mengambil…" : `Set lokasi ${k.titikB.nama}`}
                  </button>
                )}
              </div>
              <p className="text-xs leading-relaxed text-base-content/50">
                Status terupdate otomatis dari GPS. Kalau sinyal lemah, pakai mode manual saja.
              </p>
            </div>
          )}
        </div>

        {/* Timer section */}
        {showTimer && (
          <div className="relative overflow-hidden border border-accent/20 bg-base-100 p-5 shadow-md ring-1 ring-accent/10 rounded-xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.1),transparent)]" />
            <div className="relative">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                <Clock size={16} />
                Estimasi berangkat lagi
              </div>
              {mins !== null ? (
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-accent">
                    {countdown ? countdown.display : `${mins}m`}
                  </span>
                  <button
                    onClick={() => void patch({ action: "timer_clear" })}
                    className="btn btn-ghost btn-sm border border-accent/20 text-accent"
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
                        className="btn btn-ghost btn-sm border border-accent/20 text-accent"
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                  <label htmlFor="timer-custom" className="sr-only">
                    Menit custom
                  </label>
                  <input
                    id="timer-custom"
                    value={timerInput}
                    onChange={(e) => setTimerInput(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="lainnya"
                    inputMode="numeric"
                    className="input input-bordered input-sm w-16 text-xs"
                  />
                  <button
                    onClick={() => {
                      const m = parseInt(timerInput, 10);
                      if (m > 0) void patch({ action: "timer", minutes: m });
                      setTimerInput("");
                    }}
                    disabled={!timerInput}
                    className="btn btn-accent btn-sm"
                  >
                    Set
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        </div>

        {/* Riwayat Perjalanan */}
        <EventsTimeline
          events={events}
          loading={eventsLoading}
          title="Riwayat Perjalanan"
        />
    </div>
  );
}
