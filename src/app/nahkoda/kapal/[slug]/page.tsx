"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, Crosshair } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ErrorNote } from "@/components/ErrorNote";
import { StatusBadge } from "@/components/StatusBadge";
import { ChannelBar } from "@/components/ChannelBar";
import { api } from "@/lib/client/api";
import { usePolling } from "@/lib/client/usePolling";
import { formatDistance, getPosition, haversineMeters } from "@/lib/geo";
import { minutesLeft, timeAgo } from "@/lib/format";
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

  if (loading && !data) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-teal-50 shadow-xl dark:bg-slate-900">
        <ScreenHeader title="Memuat…" backHref="/nahkoda" />
        <p className="p-4 text-center text-sm text-slate-400">Mengambil data kapal…</p>
      </div>
    );
  }

  if (!k) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-teal-50 shadow-xl dark:bg-slate-900">
        <ScreenHeader title="Kapal" backHref="/nahkoda" />
        <div className="p-4">
          <ErrorNote message={error || "Kapal tidak ditemukan atau bukan milik Anda"} />
        </div>
      </div>
    );
  }

  const mins = minutesLeft(k.timerEndAt);
  const showTimer = k.status === "titik_a" || k.status === "titik_b";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-teal-50 shadow-xl dark:bg-slate-900">
      <ScreenHeader title={k.nama} subtitle={k.tambanganNama} backHref="/nahkoda" />
      <div className="flex-1 space-y-5 p-4">
        <div className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <StatusBadge status={k.status} titikA={k.titikA} titikB={k.titikB} />
            <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{timeAgo(k.lastUpdated)}</span>
          </div>
          <div className="mt-4">
            <ChannelBar status={k.status} />
            <div className="mt-1 flex justify-between font-mono text-xs text-slate-500 dark:text-slate-400">
              <span>{k.titikA.nama}</span>
              <span>{k.titikB.nama}</span>
            </div>
          </div>
        </div>

        <ErrorNote message={actionError} />

        <div>
          <div className="mb-2 flex gap-2">
            <button
              onClick={() => setMode("manual")}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold ${
                mode !== "gps"
                  ? "bg-teal-600 text-white"
                  : "border border-slate-200 bg-white text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              Mode Manual
            </button>
            <button
              onClick={() => setMode("gps")}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold ${
                mode === "gps"
                  ? "bg-teal-600 text-white"
                  : "border border-slate-200 bg-white text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              Mode GPS Otomatis
            </button>
          </div>

          {mode !== "gps" && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => void patch({ action: "status", value: "titik_a" })}
                className={`min-h-11 rounded-xl py-3 text-xs font-bold ${
                  k.status === "titik_a"
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 active:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:active:bg-slate-700"
                }`}
              >
                {k.titikA.nama}
              </button>
              <button
                onClick={() => void patch({ action: "status", value: "proses" })}
                className={`min-h-11 rounded-xl py-3 text-xs font-bold ${
                  k.status === "proses"
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 active:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:active:bg-slate-700"
                }`}
              >
                Proses ⛵
              </button>
              <button
                onClick={() => void patch({ action: "status", value: "titik_b" })}
                className={`min-h-11 rounded-xl py-3 text-xs font-bold ${
                  k.status === "titik_b"
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 active:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:active:bg-slate-700"
                }`}
              >
                {k.titikB.nama}
              </button>
            </div>
          )}

          {mode === "gps" && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
              {gpsError && <p className="text-xs text-red-600">{gpsError}</p>}
              <p className="flex items-center justify-between font-mono text-xs text-slate-600 dark:text-slate-400">
                <span>{k.titikA.nama}</span>
                <span>{formatDistance(gpsDist.a)}</span>
              </p>
              <p className="flex items-center justify-between font-mono text-xs text-slate-600 dark:text-slate-400">
                <span>{k.titikB.nama}</span>
                <span>{formatDistance(gpsDist.b)}</span>
              </p>
              <div className="flex gap-2 pt-1">
                {(k.titikA.lat === null) && (
                  <button
                    onClick={() => void captureTitik("a")}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-teal-50 py-1.5 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                  >
                    <Crosshair size={12} />
                    {gettingLoc === "a" ? "Mengambil…" : `Set lokasi ${k.titikA.nama}`}
                  </button>
                )}
                {k.titikB.lat === null && (
                  <button
                    onClick={() => void captureTitik("b")}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-teal-50 py-1.5 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                  >
                    <Crosshair size={12} />
                    {gettingLoc === "b" ? "Mengambil…" : `Set lokasi ${k.titikB.nama}`}
                  </button>
                )}
              </div>
              <p className="pt-1 text-xs text-slate-400 dark:text-slate-500">
                Status terupdate otomatis dari GPS. Fitur eksperimental — kalau sinyal lemah, pakai
                mode manual saja.
              </p>
            </div>
          )}
        </div>

        {showTimer && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-400">
              <Clock size={16} />
              Estimasi berangkat lagi
            </div>
            {mins !== null ? (
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-amber-800 dark:text-amber-400">{mins} menit</span>
                <button
                  onClick={() => void patch({ action: "timer_clear" })}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm dark:bg-slate-800 dark:text-amber-400"
                >
                  Hapus Timer
                </button>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  {[5, 10, 15].map((m) => (
                    <button
                      key={m}
                      onClick={() => void patch({ action: "timer", minutes: m })}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-sm dark:bg-slate-800 dark:text-amber-400"
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
                  className="w-16 rounded-lg border border-amber-200 px-2 py-1.5 text-xs dark:border-amber-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  onClick={() => {
                    const m = parseInt(timerInput, 10);
                    if (m > 0) void patch({ action: "timer", minutes: m });
                    setTimerInput("");
                  }}
                  disabled={!timerInput}
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
