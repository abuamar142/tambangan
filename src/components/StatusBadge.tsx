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
      <span className="badge badge-warning gap-1.5 text-sm shadow-sm">
        <Navigation size={13} />
        Menuju {destination.nama}
      </span>
    );
  }
  const label = status === "titik_a" ? titikA.nama : titikB.nama;
  return (
    <span className="badge badge-info gap-1.5 text-sm shadow-sm">
      <span className="h-2 w-2 rounded-full bg-info" />
      Standby di {label}
    </span>
  );
}
