"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Anchor, LogOut, Plus, Shield } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ErrorNote } from "@/components/ErrorNote";
import { StatusBadge } from "@/components/StatusBadge";
import { usePolling } from "@/lib/client/usePolling";
import { api } from "@/lib/client/api";
import type { KapalMineDto, UserInfo } from "@/lib/types";

export default function NahkodaPage() {
  const router = useRouter();
  const [me, setMe] = useState<UserInfo | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    api<{ user: UserInfo | null }>("/api/auth/me")
      .then((r) => {
        if (!alive) return;
        if (!r.user) {
          router.replace("/login?next=%2Fnahkoda");
          return;
        }
        setMe(r.user);
        setChecked(true);
      })
      .catch(() => {
        if (alive) router.replace("/login?next=%2Fnahkoda");
      });
    return () => {
      alive = false;
    };
  }, [router]);

  const { data, error, loading } = usePolling<{ kapal: KapalMineDto[] }>(
    (signal) => api("/api/nahkoda/kapal", { signal }),
    6000,
  );

  async function handleLogout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/");
  }

  const list = data?.kapal ?? [];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-teal-50 shadow-xl dark:bg-slate-900">
      <ScreenHeader title="Mode Nahkoda" subtitle={me ? `Halo, ${me.username}` : undefined} />
      <div className="flex-1 space-y-4 p-4">
        <div className="flex gap-2">
          <Link
            href="/nahkoda/kapal/baru"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-sm active:bg-teal-700"
          >
            <Plus size={16} />
            Daftarkan Kapal
          </Link>
          {me?.role === "admin" && (
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 active:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400 dark:active:bg-amber-900/50"
            >
              <Shield size={16} />
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 active:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:active:bg-slate-700"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>

        <ErrorNote message={error} />

        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Kapal Saya · {list.length}
        </p>

        {((loading && !data) || !checked) && (
          <p className="p-4 text-center text-sm text-slate-400 dark:text-slate-500">Memuat…</p>
        )}

        {!loading && list.length === 0 && checked && (
          <div className="rounded-xl border border-dashed border-teal-200 p-6 text-center dark:border-teal-700">
            <Anchor size={24} className="mx-auto text-teal-300 dark:text-teal-600" />
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
              Belum ada kapal. Daftarkan kapal pertama Anda.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {list.map((k) => (
            <Link
              key={k.slug}
              href={`/nahkoda/kapal/${k.slug}`}
              className="block rounded-xl border border-teal-100 bg-white p-3.5 shadow-sm active:bg-teal-50 dark:border-slate-700 dark:bg-slate-800 dark:active:bg-slate-700"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                  <Anchor size={15} className="shrink-0 text-teal-600 dark:text-teal-400" />
                  {k.nama}
                </span>
                <StatusBadge status={k.status} titikA={k.titikA} titikB={k.titikB} />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{k.tambanganNama}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
