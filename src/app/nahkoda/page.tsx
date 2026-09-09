"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Anchor, KeyRound, LogOut, Plus, Shield } from "lucide-react";
import { KapalCard } from "@/components/KapalCard";
import { ErrorNote } from "@/components/ErrorNote";
import { EmptyState } from "@/components/EmptyState";
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
      setPasswordMsg("Berhasil: password diubah");
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
    <div className="space-y-4">
      {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nahkoda/kapal/baru"
            className="btn btn-primary flex-1 md:flex-none"
          >
            <Plus size={16} />
            Daftarkan Kapal
          </Link>
          {me?.role === "admin" && (
            <Link
              href="/admin"
              className="btn btn-accent btn-outline flex-1 md:flex-none"
            >
              <Shield size={16} />
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-ghost border border-base-300"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>

        {/* Ganti Password */}
        <div className="bg-base-100 border border-base-300 p-4 shadow-sm transition-shadow hover:shadow-md rounded-xl">
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            aria-expanded={showPasswordForm}
            className="flex w-full items-center gap-2 text-sm font-semibold text-base-content"
          >
            <KeyRound size={14} />
            {showPasswordForm ? "Tutup" : "Ganti Password"}
          </button>
          {showPasswordForm && (
            <div className="mt-3 space-y-2">
              <div>
                <label htmlFor="old-password" className="mb-1 block text-xs font-medium text-base-content/70">
                  Password lama
                </label>
                <input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Password lama"
                  autoComplete="current-password"
                  className="input input-bordered w-full text-sm"
                />
              </div>
              <div>
                <label htmlFor="new-password" className="mb-1 block text-xs font-medium text-base-content/70">
                  Password baru
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 karakter"
                  autoComplete="new-password"
                  className="input input-bordered w-full text-sm"
                />
              </div>
              <button
                onClick={() => void handlePasswordChange()}
                disabled={passwordLoading}
                className="btn btn-primary btn-block"
              >
                {passwordLoading ? "Menyimpan…" : "Simpan"}
              </button>
              {passwordMsg && (
                <p className={`text-xs ${passwordMsg.startsWith("Berhasil") ? "text-success" : "text-error"}`}>
                  {passwordMsg}
                </p>
              )}
            </div>
          )}
        </div>

        <ErrorNote message={error} />

        <p className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
          Kapal Saya · {list.length}
        </p>

        {((loading && !data) || !checked) && (
          <div className="bg-base-200 p-8 text-center shadow-sm rounded-xl">
            <p className="text-sm text-base-content/50">
              Memuat…
            </p>
          </div>
        )}

        {!loading && list.length === 0 && checked && (
          <EmptyState
            icon={<Anchor size={28} />}
            title="Belum ada kapal"
            description="Daftarkan kapal pertama Anda untuk mulai."
          />
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
    </div>
  );
}
