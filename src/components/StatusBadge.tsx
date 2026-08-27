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
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
        <Navigation size={13} />
        Menyeberang
      </span>
    );
  }
  const label = status === "titik_a" ? titikA.nama : titikB.nama;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
      <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
      Standby di {label}
    </span>
  );
}
