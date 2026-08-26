import { Navigation } from "lucide-react";
import type { KapalStatus, Titik } from "@/lib/types";

export function StatusBadge({
  status,
  titikA,
  titikB,
}: {
  status: KapalStatus;
  titikA: Titik;
  titikB: Titik;
}) {
  if (status === "proses") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
        <Navigation size={14} />
        Menyeberang
      </span>
    );
  }
  const label = status === "titik_a" ? titikA.nama : titikB.nama;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Standby di {label}
    </span>
  );
}
