"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Anchor, KeyRound, LogOut, Plus, Shield } from "lucide-react";
import { Screen, ScreenContent } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { KapalCard } from "@/components/KapalCard";
import { ErrorNote } from "@/components/ErrorNote";
import { usePolling } from "@/lib/client/usePolling";
import { api } from "@/lib/client/api";
import type { KapalMineDto, UserInfo } from "@/lib/types";

export default function NahkodaPage() {
  const router = useRouter();
  const [me, setMe] = useState<UserInfo | null>(null);
  const [checked, setChecked] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

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

  async function handlePasswordChange() {
    setPasswordMsg("");
    if (!oldPassword || !newPassword) {
      setPasswordMsg("Isi semua field");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg("Password baru minimal 6 karakter");
      return;
    }
    setPasswordLoading(true);
    try {
      await api("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      setPasswordMsg("✓ Password berhasil diubah");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setShowPasswordForm(false), 1500);
    } catch (e) {
      setPasswordMsg((e as Error).message);
    } finally {
      setPasswordLoading(false);
    }
  }

  const list = data?.kapal ?? [];

  return (
    <Screen>
      <ScreenHeader title="Mode Nahkoda" subtitle={me ? `Halo, ${me.username}` : undefined} />
      <ScreenContent>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nahkoda/kapal/baru"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 active:bg-teal-800 md:flex-none"
          >
            <Plus size={16} />
            Daftarkan Kapal
          </Link>
          {me?.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100 active:bg-amber-200 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
            >
              <Shield size={16} />
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>

        {/* Ganti Password */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex w-full items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            <KeyRound size={14} />
            {showPasswordForm ? "Tutup" : "Ganti Password"}
          </button>
          {showPasswordForm && (
            <div className="mt-3 space-y-2">
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Password lama"
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password baru (min 6 karakter)"
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                onClick={() => void handlePasswordChange()}
                disabled={passwordLoading}
                className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-50"
              >
                {passwordLoading ? "Menyimpan…" : "Simpan"}
              </button>
              {passwordMsg && (
                <p className={`text-xs ${passwordMsg.startsWith("✓") ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {passwordMsg}
                </p>
              )}
            </div>
          )}
        </div>

        <ErrorNote message={error} />

        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Kapal Saya · {list.length}
        </p>

        {((loading && !data) || !checked) && (
          <p className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
            Memuat…
          </p>
        )}

        {!loading && list.length === 0 && checked && (
          <div className="rounded-2xl border border-dashed border-teal-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
            <Anchor size={28} className="mx-auto text-teal-300 dark:text-teal-600" />
            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">Belum ada kapal</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Daftarkan kapal pertama Anda untuk mulai.</p>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {list.map((k) => (
            <KapalCard
              key={k.slug}
              k={k}
              tambangan={{ id: 0, slug: "", nama: "", titikA: k.titikA, titikB: k.titikB }}
              showTime={false}
              href={`/nahkoda/kapal/${k.slug}`}
            />
          ))}
        </div>
      </ScreenContent>
    </Screen>
  );
}
