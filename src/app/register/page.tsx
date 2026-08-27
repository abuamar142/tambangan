"use client";

import { useState } from "react";
import Link from "next/link";
import { Anchor } from "lucide-react";
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
    <div className="min-h-screen bg-teal-50 dark:bg-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8 md:max-w-lg md:px-6">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="rounded-3xl border border-teal-100 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800 md:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
              <Anchor size={24} />
            </div>
            <h1 className="mt-4 text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 md:text-2xl">
              Daftar Nahkoda
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Buat akun untuk mendaftarkan kapal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorNote message={error} />
            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full rounded-xl bg-teal-600 py-3.5 font-bold text-white shadow-md transition hover:bg-teal-700 active:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Memproses…" : "Daftar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-teal-700 hover:underline dark:text-teal-400">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
