"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Map,
  ArrowLeft,
  RotateCcw,
  Trash2,
  Save,
  Anchor,
  Pencil,
  X,
} from "lucide-react";
import { ErrorNote } from "@/components/ErrorNote";
import { api } from "@/lib/client/api";
import type { UserInfo } from "@/lib/types";

interface UserRow {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}

interface TambanganRow {
  id: number;
  slug: string;
  nama: string;
  titik_a_nama: string;
  titik_a_lat: number | null;
  titik_a_lng: number | null;
  titik_b_nama: string;
  titik_b_lat: number | null;
  titik_b_lng: number | null;
}

type Tab = "users" | "tambangan";

export default function AdminPage() {
  const router = useRouter();
  const [me, setMe] = useState<UserInfo | null>(null);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("users");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api<{ user: UserInfo | null }>("/api/auth/me")
      .then((r) => {
        if (!alive) return;
        if (!r.user || r.user.role !== "admin") {
          router.replace("/login?next=%2Fadmin");
          return;
        }
        setMe(r.user);
        setChecked(true);
      })
      .catch(() => {
        if (alive) router.replace("/login?next=%2Fadmin");
      });
    return () => { alive = false; };
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-sm text-slate-400 dark:text-slate-500">Memuat…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/nahkoda")}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 dark:active:bg-slate-600"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-lg">
                <Shield size={18} className="text-teal-600" />
                Panel Admin
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                {me ? `Masuk sebagai ${me.username}` : ""}
              </p>
            </div>
          </div>
          <a
            href="/nahkoda"
            className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 md:flex"
          >
            Dashboard Nahkoda →
          </a>
        </div>
      </header>

      {/* Tab bar */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-6xl gap-0 px-4 md:px-6">
          <button
            onClick={() => { setTab("users"); setError(""); }}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              tab === "users"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Users size={16} />
            Pengguna
          </button>
          <button
            onClick={() => { setTab("tambangan"); setError(""); }}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              tab === "tambangan"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Map size={16} />
            Tambangan
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <ErrorNote message={error} />
        {tab === "users" && <UsersTab setError={setError} />}
        {tab === "tambangan" && <TambanganTab setError={setError} />}
      </main>
    </div>
  );
}

/* ─── Users Tab ──────────────────────────────────────────── */

function UsersTab({ setError }: { setError: (s: string) => void }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newPass, setNewPass] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await api<{ users: UserRow[] }>("/api/admin/users");
        if (alive) setUsers(r.users);
      } catch {
        if (alive) setError("Gagal memuat pengguna");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [setError, tick]);

  async function handleResetPassword(id: number) {
    if (!newPass || newPass.length < 4) {
      setError("Password minimal 4 karakter");
      return;
    }
    try {
      await api(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ password: newPass }),
      });
      setExpandedId(null);
      setNewPass("");
      setError("");
      setTick((t) => t + 1);
    } catch {
      setError("Gagal reset password");
    }
  }

  async function handleDelete(id: number, username: string) {
    if (!confirm(`Hapus pengguna "${username}"?`)) return;
    try {
      await api(`/api/admin/users/${id}`, { method: "DELETE" });
      setTick((t) => t + 1);
    } catch {
      setError("Gagal menghapus pengguna");
    }
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">Memuat…</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Semua Pengguna · <span className="text-slate-900 dark:text-slate-100">{users.length}</span>
        </h2>
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {users.map((u) => (
              <Fragment key={u.id}>
                <tr key={u.id} className="hover:bg-slate-50 dark:bg-slate-900">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{u.username}</td>
                  <td className="px-4 py-3">
                    {u.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        <Shield size={11} /> Admin
                      </span>
                    ) : (
                      <span className="text-slate-500">Nahkoda</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setExpandedId(expandedId === u.id ? null : u.id);
                          setNewPass("");
                          setError("");
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        title="Reset Password"
                      >
                        <RotateCcw size={14} />
                      </button>
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleDelete(u.id, u.username)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === u.id && (
                  <tr key={`${u.id}-expand`} className="bg-blue-50/50">
                    <td colSpan={4} className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-600">Password baru:</span>
                        <input
                          type="password"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-48 rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                        />
                        <button
                          onClick={() => handleResetPassword(u.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700"
                        >
                          <Save size={12} /> Simpan
                        </button>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                        >
                          Batal
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="space-y-2 md:hidden">
        {users.map((u) => (
          <div key={u.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">{u.username}</p>
                <p className="text-xs text-slate-500">
                  {u.role === "admin" ? (
                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                      <Shield size={11} /> Admin
                    </span>
                  ) : (
                    "Nahkoda"
                  )}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setExpandedId(expandedId === u.id ? null : u.id);
                    setNewPass("");
                    setError("");
                  }}
                  className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 active:bg-blue-100"
                  title="Reset Password"
                >
                  <RotateCcw size={14} />
                </button>
                {u.role !== "admin" && (
                  <button
                    onClick={() => handleDelete(u.id, u.username)}
                    className="rounded-lg bg-red-50 p-2 text-red-500 dark:bg-red-900/30 dark:text-red-400 active:bg-red-100"
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            {expandedId === u.id && (
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Password baru"
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
                <button
                  onClick={() => handleResetPassword(u.id)}
                  className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white active:bg-teal-700"
                >
                  <Save size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tambangan Tab ──────────────────────────────────────── */

function TambanganTab({ setError }: { setError: (s: string) => void }) {
  const [list, setList] = useState<TambanganRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    nama: "",
    titik_a_nama: "",
    titik_b_nama: "",
    titik_a_lat: "",
    titik_a_lng: "",
    titik_b_lat: "",
    titik_b_lng: "",
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await api<{ tambangan: TambanganRow[] }>("/api/admin/tambangan");
        if (alive) setList(r.tambangan);
      } catch {
        if (alive) setError("Gagal memuat tambangan");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [setError, tick]);

  function startEdit(t: TambanganRow) {
    setExpandedSlug(t.slug);
    setEditForm({
      nama: t.nama,
      titik_a_nama: t.titik_a_nama,
      titik_b_nama: t.titik_b_nama,
      titik_a_lat: t.titik_a_lat?.toString() ?? "",
      titik_a_lng: t.titik_a_lng?.toString() ?? "",
      titik_b_lat: t.titik_b_lat?.toString() ?? "",
      titik_b_lng: t.titik_b_lng?.toString() ?? "",
    });
  }

  async function handleSave(slug: string) {
    try {
      const body: Record<string, unknown> = {
        nama: editForm.nama,
        titikANama: editForm.titik_a_nama,
        titikBNama: editForm.titik_b_nama,
      };
      if (editForm.titik_a_lat) body.titikALat = parseFloat(editForm.titik_a_lat);
      if (editForm.titik_a_lng) body.titikALng = parseFloat(editForm.titik_a_lng);
      if (editForm.titik_b_lat) body.titikBLat = parseFloat(editForm.titik_b_lat);
      if (editForm.titik_b_lng) body.titikBLng = parseFloat(editForm.titik_b_lng);

      await api(`/api/admin/tambangan/${slug}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setExpandedSlug(null);
      setTick((t) => t + 1);
    } catch {
      setError("Gagal menyimpan perubahan");
    }
  }

  async function handleDelete(slug: string, nama: string) {
    if (!confirm(`Hapus tambangan "${nama}"? Semua kapal terkait juga akan dihapus.`)) return;
    try {
      await api(`/api/admin/tambangan/${slug}`, { method: "DELETE" });
      setTick((t) => t + 1);
    } catch {
      setError("Gagal menghapus tambangan");
    }
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">Memuat…</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Semua Tambangan · <span className="text-slate-900 dark:text-slate-100">{list.length}</span>
        </h2>
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Titik A</th>
              <th className="px-4 py-3">Titik B</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {list.map((t) => (
              <Fragment key={t.slug}>
                <tr key={t.slug} className="hover:bg-slate-50 dark:bg-slate-900">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Anchor size={14} className="shrink-0 text-teal-500" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">{t.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {t.titik_a_nama}
                    {t.titik_a_lat != null && (
                      <span className="ml-1 text-xs text-slate-400">
                        ({t.titik_a_lat.toFixed(3)}, {t.titik_a_lng?.toFixed(3)})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {t.titik_b_nama}
                    {t.titik_b_lat != null && (
                      <span className="ml-1 text-xs text-slate-400">
                        ({t.titik_b_lat.toFixed(3)}, {t.titik_b_lng?.toFixed(3)})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setExpandedSlug(expandedSlug === t.slug ? null : t.slug);
                          setError("");
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.slug, t.nama)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedSlug === t.slug && (
                  <tr key={`${t.slug}-expand`} className="bg-blue-50/50">
                    <td colSpan={4} className="px-4 py-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-700 dark:text-teal-400">Edit Tambangan</span>
                          <button onClick={() => setExpandedSlug(null)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                            <X size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                          <div className="col-span-2 lg:col-span-3">
                            <label className="mb-1 block text-xs font-medium text-slate-500">Nama</label>
                            <input
                              value={editForm.nama}
                              onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Titik A Nama</label>
                            <input
                              value={editForm.titik_a_nama}
                              onChange={(e) => setEditForm({ ...editForm, titik_a_nama: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Titik A Lat</label>
                            <input
                              value={editForm.titik_a_lat}
                              onChange={(e) => setEditForm({ ...editForm, titik_a_lat: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Titik A Lng</label>
                            <input
                              value={editForm.titik_a_lng}
                              onChange={(e) => setEditForm({ ...editForm, titik_a_lng: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Titik B Nama</label>
                            <input
                              value={editForm.titik_b_nama}
                              onChange={(e) => setEditForm({ ...editForm, titik_b_nama: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Titik B Lat</label>
                            <input
                              value={editForm.titik_b_lat}
                              onChange={(e) => setEditForm({ ...editForm, titik_b_lat: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Titik B Lng</label>
                            <input
                              value={editForm.titik_b_lng}
                              onChange={(e) => setEditForm({ ...editForm, titik_b_lng: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleSave(t.slug)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600"
                        >
                          <Save size={14} /> Simpan Perubahan
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="space-y-2 md:hidden">
        {list.map((t) => (
          <div key={t.slug} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            {expandedSlug === t.slug ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-400">Edit Tambangan</p>
                  <button onClick={() => setExpandedSlug(null)} className="text-slate-400">
                    <X size={14} />
                  </button>
                </div>
                <input
                  value={editForm.nama}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  placeholder="Nama"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={editForm.titik_a_nama}
                    onChange={(e) => setEditForm({ ...editForm, titik_a_nama: e.target.value })}
                    placeholder="Titik A nama"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                  <input
                    value={editForm.titik_b_nama}
                    onChange={(e) => setEditForm({ ...editForm, titik_b_nama: e.target.value })}
                    placeholder="Titik B nama"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={editForm.titik_a_lat}
                    onChange={(e) => setEditForm({ ...editForm, titik_a_lat: e.target.value })}
                    placeholder="Titik A lat"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                  <input
                    value={editForm.titik_a_lng}
                    onChange={(e) => setEditForm({ ...editForm, titik_a_lng: e.target.value })}
                    placeholder="Titik A lng"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={editForm.titik_b_lat}
                    onChange={(e) => setEditForm({ ...editForm, titik_b_lat: e.target.value })}
                    placeholder="Titik B lat"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                  <input
                    value={editForm.titik_b_lng}
                    onChange={(e) => setEditForm({ ...editForm, titik_b_lng: e.target.value })}
                    placeholder="Titik B lng"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>
                <button
                  onClick={() => handleSave(t.slug)}
                  className="w-full rounded-lg bg-teal-600 py-2 text-xs font-bold text-white active:bg-teal-700"
                >
                  Simpan
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Anchor size={14} className="text-teal-600" />
                    <p className="font-bold text-slate-900">{t.nama}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t.titik_a_nama} → {t.titik_b_nama}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => startEdit(t)}
                    className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 active:bg-blue-100"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.slug, t.nama)}
                    className="rounded-lg bg-red-50 p-2 text-red-500 dark:bg-red-900/30 dark:text-red-400 active:bg-red-100"
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
