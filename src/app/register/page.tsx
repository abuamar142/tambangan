"use client";

import { useState } from "react";
import Link from "next/link";
import { Anchor } from "lucide-react";
import { api } from "@/lib/client/api";
import { ErrorNote } from "@/components/ErrorNote";
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
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-teal-50 px-4 shadow-xl dark:bg-slate-900">
      <div className="mb-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white">
          <Anchor size={24} />
        </div>
        <h1 className="mt-3 text-xl font-extrabold tracking-tight">Daftar Nahkoda</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Buat akun untuk mendaftarkan kapal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <ErrorNote message={error} />
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username (huruf/angka)"
          autoCapitalize="none"
          autoComplete="username"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 karakter)"
          autoComplete="new-password"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Ulangi password"
          autoComplete="new-password"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full rounded-xl bg-teal-600 py-3 font-bold text-white shadow-sm active:bg-teal-700 disabled:opacity-50"
        >
          {loading ? "Memproses…" : "Daftar"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-teal-700 dark:text-teal-400">
          Masuk
        </Link>
      </p>
    </div>
  );
}
