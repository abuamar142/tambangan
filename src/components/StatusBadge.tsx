import { Navigation } from "lucide-react";
import type { KapalStatus, Titik } from "@/lib/types";

export function StatusBadge({
  status,
  departingFrom,
  titikA,
  titikB,
}: {
  status: KapalStatus;
  departingFrom?: KapalStatus | null;
  titikA: Titik;
  titikB: Titik;
}) {
  if (status === "proses") {
    const destination = departingFrom === "titik_a" ? titikB : titikA;
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-accent)] shadow-sm">
        <Navigation size={13} />
        Menuju {destination.nama}
      </span>
    );
  }
  const label = status === "titik_a" ? titikA.nama : titikB.nama;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand)]/25 bg-[var(--color-brand)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-brand)] shadow-sm">
      <span className="h-2 w-2 rounded-full bg-[var(--color-brand)]" />
      Standby di {label}
    </span>
  );
}
