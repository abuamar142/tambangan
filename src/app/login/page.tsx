"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Anchor } from "lucide-react";
import { api } from "@/lib/client/api";
import { ErrorNote } from "@/components/ErrorNote";
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
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-teal-50 px-4 shadow-xl dark:bg-slate-900">
      <div className="mb-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white">
          <Anchor size={24} />
        </div>
        <h1 className="mt-3 text-xl font-extrabold tracking-tight">Masuk Nahkoda</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Masuk untuk mengelola kapal Anda</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <ErrorNote message={error} />
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoCapitalize="none"
          autoComplete="username"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full rounded-xl bg-teal-600 py-3 font-bold text-white shadow-sm active:bg-teal-700 disabled:opacity-50"
        >
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-teal-700 dark:text-teal-400">
          Daftar
        </Link>
      </p>
      <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <Link href="/">Kembali ke beranda</Link>
      </p>
    </div>
  );
}
