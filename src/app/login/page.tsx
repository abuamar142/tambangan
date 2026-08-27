"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Anchor } from "lucide-react";
import { api } from "@/lib/client/api";
import { ErrorNote } from "@/components/ErrorNote";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { UserInfo } from "@/lib/types";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api<{ user: UserInfo }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      const next = params.get("next");
      window.location.href = next && next.startsWith("/") ? next : "/nahkoda";
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
              Masuk Nahkoda
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Masuk untuk mengelola kapal Anda</p>
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
                placeholder="Username"
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
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full rounded-xl bg-teal-600 py-3.5 font-bold text-white shadow-md transition hover:bg-teal-700 active:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Memproses…" : "Masuk"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-teal-700 hover:underline dark:text-teal-400">
              Daftar
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          <Link href="/" className="hover:text-teal-600 dark:hover:text-teal-400">
            ← Kembali ke beranda
          </Link>
        </p>
      </div>
    </div>
  );
}
