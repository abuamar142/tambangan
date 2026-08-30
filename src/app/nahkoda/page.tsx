"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Anchor, KeyRound, LogOut, Plus, Shield } from "lucide-react";
import { Screen, ScreenContent } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
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
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nahkoda/kapal/baru"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-3 text-sm font-bold text-[var(--color-brand-foreground)] shadow-[var(--shadow-glow-brand)] transition-all duration-200 hover:bg-[var(--color-brand-dark)] hover:shadow-xl active:bg-[var(--color-brand-800)] md:flex-none"
          >
            <Plus size={16} />
            Daftarkan Kapal
          </Link>
          {me?.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-4 py-3 text-sm font-bold text-[var(--color-accent)] transition-all duration-200 hover:bg-[var(--color-accent)]/20"
            >
              <Shield size={16} />
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:bg-[var(--color-surface-alt)] hover:shadow-[var(--shadow-md)]"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>

        {/* Ganti Password */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            aria-expanded={showPasswordForm}
            className="flex w-full items-center gap-2 text-sm font-semibold text-[var(--color-text)]"
          >
            <KeyRound size={14} />
            {showPasswordForm ? "Tutup" : "Ganti Password"}
          </button>
          {showPasswordForm && (
            <div className="mt-3 space-y-2">
              <div>
                <label htmlFor="old-password" className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">
                  Password lama
                </label>
                <input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Password lama"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
                />
              </div>
              <div>
                <label htmlFor="new-password" className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">
                  Password baru
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 karakter"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
                />
              </div>
              <button
                onClick={() => void handlePasswordChange()}
                disabled={passwordLoading}
                className="w-full rounded-xl bg-[var(--color-brand)] py-2.5 text-sm font-bold text-[var(--color-brand-foreground)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:bg-[var(--color-brand-dark)] hover:shadow-[var(--shadow-md)] disabled:opacity-50"
              >
                {passwordLoading ? "Menyimpan…" : "Simpan"}
              </button>
              {passwordMsg && (
                <p className={`text-xs ${passwordMsg.startsWith("✓") ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                  {passwordMsg}
                </p>
              )}
            </div>
          )}
        </div>

        <ErrorNote message={error} />

        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Kapal Saya · {list.length}
        </p>

        {((loading && !data) || !checked) && (
          <div className="rounded-xl bg-[var(--color-surface-alt)] p-8 text-center shadow-[var(--shadow-sm)]">
            <p className="text-sm text-[var(--color-text-muted)]">
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
      </ScreenContent>
    </Screen>
  );
}
