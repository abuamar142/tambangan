"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crosshair, Loader2 } from "lucide-react";
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

          {/* Step 1: Nama Kapal */}
          <div>
            <label htmlFor="nama-kapal" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
              Nama Kapal
            </label>
            <input
              id="nama-kapal"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="cth. Perahu Jaya 1"
              required
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3 text-base text-[var(--color-text)] outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
            />
          </div>

          {/* Step 2: Pilih / Buat Tambangan */}
          {!buatBaru ? (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
                Pilih Tambangan
              </label>
              <div className="grid gap-2 md:grid-cols-2">
                {list.length === 0 && (
                  <p className="col-span-full rounded-xl border border-dashed border-[var(--color-border)] p-4 text-center text-sm text-[var(--color-text-muted)]">
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
                    className={`rounded-xl border p-4 text-left shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] ${
                      pilihId === t.id && !buatBaru
                        ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5 ring-1 ring-[var(--color-brand)]/20"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand)]/30"
                    }`}
                  >
                    <span className="font-bold text-[var(--color-text)]">{t.nama}</span>
                    <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                      {t.titikA.nama} ↔ {t.titikB.nama}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setBuatBaru(true)}
                className="mt-3 w-full rounded-xl border border-dashed border-[var(--color-brand)]/30 bg-[var(--color-brand)]/5 py-3 text-sm font-semibold text-[var(--color-brand)] transition-all duration-200 hover:bg-[var(--color-brand)]/10"
              >
                + Buat Tambangan Baru
              </button>
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)]">Tambangan Baru</span>
                <button
                  type="button"
                  onClick={() => setBuatBaru(false)}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]"
                >
                  Batal
                </button>
              </div>
              <div>
                <label htmlFor="nama-tambangan" className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">
                  Nama Tambangan
                </label>
                <input
                  id="nama-tambangan"
                  value={namaTambangan}
                  onChange={(e) => setNamaTambangan(e.target.value)}
                  placeholder="Nama tambangan, cth. Jatikalen - Megaluh"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
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
              <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
                Posisi GPS diambil dari perangkat Anda — berdiri di dermaga saat menekan tombol.
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !nama.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] py-3.5 font-bold text-[var(--color-brand-foreground)] shadow-[var(--shadow-glow-brand)] transition-all duration-200 hover:bg-[var(--color-brand-dark)] hover:shadow-xl active:bg-[var(--color-brand-800)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Menyimpan…
              </>
            ) : (
              "Daftarkan Kapal"
            )}
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
  const inputId = `titik-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={inputId} className="w-14 shrink-0 font-mono text-xs font-bold text-[var(--color-text-muted)]">
        {label}
      </label>
      <input
        id={inputId}
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        placeholder="Nama tempat"
        className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
      />
      <button
        type="button"
        onClick={onCapture}
        disabled={getting}
        className={`inline-flex shrink-0 items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
          coord
            ? "bg-[var(--color-success)]/10 text-[var(--color-success)] ring-1 ring-[var(--color-success)]/20"
            : "bg-[var(--color-brand)]/10 text-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/20"
        }`}
      >
        <Crosshair size={13} />
        {getting ? "…" : coord ? `${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)}` : "GPS"}
      </button>
    </div>
  );
}
