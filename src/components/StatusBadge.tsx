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
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-info)]/20 bg-[var(--color-info)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-info)]">
        <Navigation size={13} />
        Menuju {destination.nama}
      </span>
    );
  }
  const label = status === "titik_a" ? titikA.nama : titikB.nama;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-success)]/20 bg-[var(--color-success)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-success)]">
      <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
      Standby di {label}
    </span>
  );
}
