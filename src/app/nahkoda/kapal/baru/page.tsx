"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crosshair } from "lucide-react";
import { Screen, ScreenContent } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ErrorNote } from "@/components/ErrorNote";
import { api } from "@/lib/client/api";
import { getPosition } from "@/lib/geo";
import type { TambanganDto } from "@/lib/types";

export default function KapalBaruPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [list, setList] = useState<TambanganDto[]>([]);
  const [pilihId, setPilihId] = useState<number | null>(null);
  const [buatBaru, setBuatBaru] = useState(false);

  const [namaTambangan, setNamaTambangan] = useState("");
  const [titikA, setTitikA] = useState("Jatikalen");
  const [titikB, setTitikB] = useState("Megaluh");
  const [coordA, setCoordA] = useState<{ lat: number; lng: number } | null>(null);
  const [coordB, setCoordB] = useState<{ lat: number; lng: number } | null>(null);

  const [gettingLoc, setGettingLoc] = useState<"a" | "b" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<{ tambangan: TambanganDto[] }>("/api/tambangan")
      .then((r) => {
        setList(r.tambangan);
        if (r.tambangan.length > 0) setPilihId(r.tambangan[0].id);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  async function capture(side: "a" | "b") {
    setError("");
    setGettingLoc(side);
    try {
      const pos = await getPosition();
      const coord = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (side === "a") setCoordA(coord);
      else setCoordB(coord);
    } catch (e) {
      setError((e as Error).message ?? "Gagal mengambil lokasi GPS");
    } finally {
      setGettingLoc(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nama.trim()) {
      setError("Isi nama kapal dulu");
      return;
    }

    setLoading(true);
    try {
      let tambanganId = pilihId;
      if (buatBaru) {
        if (!namaTambangan.trim() || !titikA.trim() || !titikB.trim()) {
          throw new Error("Lengkapi nama tambangan dan kedua titik");
        }
        const created = await api<{ tambangan: TambanganDto }>("/api/tambangan", {
          method: "POST",
          body: JSON.stringify({
            nama: namaTambangan,
            titikANama: titikA,
            titikALat: coordA?.lat ?? null,
            titikALng: coordA?.lng ?? null,
            titikBNama: titikB,
            titikBLat: coordB?.lat ?? null,
            titikBLng: coordB?.lng ?? null,
          }),
        });
        tambanganId = created.tambangan.id;
      }
      if (!tambanganId) throw new Error("Pilih tambangan dulu");

      const res = await api<{ slug: string }>("/api/kapal", {
        method: "POST",
        body: JSON.stringify({ nama, tambanganId }),
      });
      router.replace(`/nahkoda/kapal/${res.slug}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Daftarkan Kapal" backHref="/nahkoda" />
      <ScreenContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <ErrorNote message={error} />

          <div>
            <label htmlFor="nama-kapal" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">
              Nama Kapal
            </label>
            <input
              id="nama-kapal"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="cth. Perahu Jaya 1"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          {!buatBaru ? (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                Pilih Tambangan
              </label>
              <div className="grid gap-2 md:grid-cols-2">
                {list.length === 0 && (
                  <p className="col-span-full rounded-xl border border-dashed border-teal-200 p-4 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                    Belum ada tambangan. Buat baru di bawah.
                  </p>
                )}
                {list.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setPilihId(t.id);
                      setBuatBaru(false);
                    }}
                    className={`rounded-2xl border p-4 text-left shadow-sm transition hover:shadow-md ${
                      pilihId === t.id && !buatBaru
                        ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500/20 dark:border-teal-600 dark:bg-teal-900/30"
                        : "border-teal-100 bg-white hover:border-teal-200 dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  >
                    <span className="font-bold text-slate-900 dark:text-slate-100">{t.nama}</span>
                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                      {t.titikA.nama} ↔ {t.titikB.nama}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setBuatBaru(true)}
                className="mt-3 w-full rounded-xl border border-dashed border-teal-300 bg-teal-50/50 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 dark:border-teal-700 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30"
              >
                + Buat Tambangan Baru
              </button>
            </div>
          ) : (
            <div className="space-y-4 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400">Tambangan Baru</span>
                <button
                  type="button"
                  onClick={() => setBuatBaru(false)}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Nama Tambangan</label>
                <input
                  value={namaTambangan}
                  onChange={(e) => setNamaTambangan(e.target.value)}
                  placeholder="Nama tambangan, cth. Jatikalen - Megaluh"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <TitikInput
                label="Titik A"
                nama={titikA}
                setNama={setTitikA}
                coord={coordA}
                getting={gettingLoc === "a"}
                onCapture={() => capture("a")}
              />
              <TitikInput
                label="Titik B"
                nama={titikB}
                setNama={setTitikB}
                coord={coordB}
                getting={gettingLoc === "b"}
                onCapture={() => capture("b")}
              />
              <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                Posisi GPS diambil dari perangkat Anda — berdiri di dermaga saat menekan tombol.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !nama.trim()}
            className="w-full rounded-xl bg-teal-600 py-3.5 font-bold text-white shadow-md transition hover:bg-teal-700 active:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Menyimpan…" : "Daftarkan Kapal"}
          </button>
        </form>
      </ScreenContent>
    </Screen>
  );
}

function TitikInput({
  label,
  nama,
  setNama,
  coord,
  getting,
  onCapture,
}: {
  label: string;
  nama: string;
  setNama: (v: string) => void;
  coord: { lat: number; lng: number } | null;
  getting: boolean;
  onCapture: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">{label}</span>
      <input
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        placeholder="Nama tempat"
        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
      <button
        type="button"
        onClick={onCapture}
        disabled={getting}
        className={`inline-flex shrink-0 items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
          coord
            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800"
            : "bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-800"
        }`}
      >
        <Crosshair size={13} />
        {getting ? "…" : coord ? `${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)}` : "GPS"}
      </button>
    </div>
  );
}
