"use client";

import { useState } from "react";
import Link from "next/link";
import { Anchor, Loader2 } from "lucide-react";
import { api } from "@/lib/client/api";
import { ErrorNote } from "@/components/ErrorNote";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { UserInfo } from "@/lib/types";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Konfirmasi password tidak sama");
      return;
    }
    setLoading(true);
    try {
      await api<{ user: UserInfo }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- cookie race condition: router.replace() loses the freshly-set session cookie during soft navigation
      window.location.href = "/nahkoda";
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8 md:max-w-lg md:px-6">
        <div className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-xl)] md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,148,136,0.12),transparent)]" />
          <div className="relative">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand)] text-[var(--color-brand-foreground)] shadow-[var(--shadow-glow-brand)]">
                  <Anchor size={24} />
                </div>
                <h1 className="mt-4 text-xl font-bold tracking-tight text-[var(--color-text)] md:text-2xl">
                  Daftar Nahkoda
                </h1>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Buat akun untuk mendaftarkan kapal</p>
              </div>
              <div className="absolute right-4 top-4">
                <ThemeToggle />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <ErrorNote message={error} />
              <div>
                <label htmlFor="username" className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
                  Username
                </label>
                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username (huruf/angka)"
                  autoCapitalize="none"
                  autoComplete="username"
                  required
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3 text-base text-[var(--color-text)] outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 karakter)"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3 text-base text-[var(--color-text)] outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
                />
              </div>
              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
                  Ulangi Password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3 text-base text-[var(--color-text)] outline-none transition-all duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] py-3.5 font-bold text-[var(--color-brand-foreground)] shadow-[var(--shadow-glow-brand)] transition-all duration-200 hover:bg-[var(--color-brand-dark)] hover:shadow-xl active:bg-[var(--color-brand-800)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Memproses…
                  </>
                ) : (
                  "Daftar"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-[var(--color-brand)] hover:underline">
                Masuk
              </Link>
            </p>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          <Link href="/" className="hover:text-[var(--color-brand)]">
            ← Kembali ke beranda
          </Link>
        </p>
      </div>
    </div>
  );
}
