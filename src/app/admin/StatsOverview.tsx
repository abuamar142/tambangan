"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import type { UserRow, TambanganRow, KapalRow } from "./types";

export function StatsOverview() {
  const [stats, setStats] = useState<{ users: number; tambangan: number; kapal: number; aktif: number } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [u, t, k] = await Promise.all([
          api<{ users: UserRow[] }>("/api/admin/users"),
          api<{ tambangan: TambanganRow[] }>("/api/admin/tambangan"),
          api<{ kapal: KapalRow[] }>("/api/admin/kapal"),
        ]);
        if (alive) {
          setStats({
            users: u.users.length,
            tambangan: t.tambangan.length,
            kapal: k.kapal.length,
            aktif: k.kapal.filter((k) => k.status === "proses").length,
          });
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  if (!stats) return null;

  const items = [
    { label: "Pengguna", value: stats.users, color: "bg-info/10 text-info" },
    { label: "Tambangan", value: stats.tambangan, color: "bg-primary/10 text-primary" },
    { label: "Total Kapal", value: stats.kapal, color: "bg-success/10 text-success" },
    { label: "Sedang Berangkat", value: stats.aktif, color: "bg-accent/10 text-accent" },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className={`stat card bg-base-100 shadow-sm transition-shadow hover:shadow-md ${item.color}`}>
          <p className="stat-value text-2xl">{item.value}</p>
          <p className="stat-desc">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
