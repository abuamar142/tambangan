"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Users,
  Map,
  RotateCcw,
  Trash2,
  Save,
  Anchor,
  Pencil,
  X,
} from "lucide-react";
import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ErrorNote } from "@/components/ErrorNote";
import { api } from "@/lib/client/api";
import type { UserInfo } from "@/lib/types";

interface UserRow {
  id: number;
  username: string;
  role: string;
  tambanganId: number | null;
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

interface KapalRow {
  slug: string;
  nama: string;
  status: string;
  tambanganNama: string;
  ownerUsername: string;
  lastUpdatedAt: string;
}

type Tab = "users" | "tambangan" | "kapal";

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "users", label: "Pengguna", icon: Users },
  { id: "tambangan", label: "Tambangan", icon: Map },
  { id: "kapal", label: "Kapal", icon: Anchor },
];

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
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <p className="text-sm text-[var(--color-text-secondary)]">Memuat…</p>
      </div>
    );
  }

  return (
    <Screen size="wide">
      <ScreenHeader
        title="Panel Admin"
        subtitle={me ? `Masuk sebagai ${me.username}` : undefined}
        backHref="/nahkoda"
      />

      {/* Tab bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex gap-0 px-4 md:px-6">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                aria-controls={`panel-${t.id}`}
                onClick={() => { setTab(t.id); setError(""); }}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
          <div className="flex flex-1 items-center justify-end">
            <Link
              href="/nahkoda"
              className="hidden items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)] md:inline-flex"
            >
              Dashboard Nahkoda →
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div role="tabpanel" id={`panel-${tab}`}>
          {tab === "users" && <StatsOverview />}
          <ErrorNote message={error} />
          {tab === "users" && <UsersTab setError={setError} />}
          {tab === "tambangan" && <TambanganTab setError={setError} />}
          {tab === "kapal" && <KapalTab setError={setError} />}
        </div>
      </main>
    </Screen>
  );
}

/* ─── Stats Overview ──────────────────────────────────── */

function StatsOverview() {
  const [stats, setStats] = useState<{ users: number; tambangan: number; kapal: number; aktif: number } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [u, t, k] = await Promise.all([
          api<{ users: UserRow[] }>("/api/admin/users"),
          api<{ tambangan: TambanganRow[] }>("/api/admin/tambangan"),
          api<{ kapal: KapalRow[] }>("/api/admin/kapal"),
        ]);
        if (alive) {
          setStats({
            users: u.users.length,
            tambangan: t.tambangan.length,
            kapal: k.kapal.length,
            aktif: k.kapal.filter((k) => k.status === "proses").length,
          });
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  if (!stats) return null;

  const items = [
    { label: "Pengguna", value: stats.users, color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    { label: "Tambangan", value: stats.tambangan, color: "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
    { label: "Total Kapal", value: stats.kapal, color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { label: "Sedang Berangkat", value: stats.aktif, color: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className={`rounded-xl p-4 ${item.color}`}>
          <p className="text-2xl font-bold">{item.value}</p>
          <p className="text-xs font-medium opacity-75">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Kapal Tab ──────────────────────────────────────── */

function KapalTab({ setError }: { setError: (s: string) => void }) {
  const [kapalList, setKapalList] = useState<KapalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await api<{ kapal: KapalRow[] }>("/api/admin/kapal");
        if (alive) setKapalList(r.kapal);
      } catch {
        if (alive) setError("Gagal memuat kapal");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [setError, tick]);

  async function handleRename(slug: string) {
    if (!editName.trim()) return;
    try {
      await api(`/api/admin/kapal/${slug}`, {
        method: "PATCH",
        body: JSON.stringify({ nama: editName.trim() }),
      });
      setExpandedSlug(null);
      setTick((t) => t + 1);
    } catch {
      setError("Gagal mengubah nama kapal");
    }
  }

  async function handleDelete(slug: string, nama: string) {
    if (!confirm(`Hapus kapal "${nama}"?`)) return;
    try {
      await api(`/api/admin/kapal/${slug}`, { method: "DELETE" });
      setTick((t) => t + 1);
    } catch {
      setError("Gagal menghapus kapal");
    }
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-[var(--color-text-secondary)]">Memuat…</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">
          Semua Kapal · <span className="text-[var(--color-text)]">{kapalList.length}</span>
        </h2>
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)] text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tambangan</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {kapalList.map((k) => (
              <Fragment key={k.slug}>
                <tr className="hover:bg-[var(--color-bg)]">
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">{k.nama}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      k.status === "proses"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    }`}>
                      {k.status === "proses" ? "Menyeberang" : `Standby`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{k.tambanganNama}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{k.ownerUsername}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setExpandedSlug(expandedSlug === k.slug ? null : k.slug);
                          setEditName(k.nama);
                          setError("");
                        }}
                        className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                        title="Edit Nama"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => void handleDelete(k.slug, k.nama)}
                        className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedSlug === k.slug && (
                  <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-[var(--color-text-secondary)]">Nama baru:</span>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") void handleRename(k.slug); }}
                          className="w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                        />
                        <button onClick={() => void handleRename(k.slug)} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700">
                          <Save size={12} /> Simpan
                        </button>
                        <button onClick={() => setExpandedSlug(null)} className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
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
        {kapalList.map((k) => (
          <div key={k.slug} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-sm">
            {expandedSlug === k.slug ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-teal-700 dark:text-teal-400">Edit Nama</p>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleRename(k.slug); }}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-teal-500"
                />
                <div className="flex gap-2">
                  <button onClick={() => void handleRename(k.slug)} className="flex-1 rounded-lg bg-teal-600 py-2 text-xs font-bold text-white active:bg-teal-700">Simpan</button>
                  <button onClick={() => setExpandedSlug(null)} className="rounded-lg bg-[var(--color-bg)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)]">Batal</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[var(--color-text)]">{k.nama}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{k.tambanganNama} · {k.ownerUsername}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setExpandedSlug(k.slug); setEditName(k.nama); }}
                    className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    title="Edit Nama"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => void handleDelete(k.slug, k.nama)}
                    className="rounded-lg bg-red-50 p-2 text-red-500 dark:bg-red-900/30 dark:text-red-400"
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

/* ─── Users Tab ──────────────────────────────────────────── */

function UsersTab({ setError }: { setError: (s: string) => void }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [tambanganList, setTambanganList] = useState<TambanganRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newPass, setNewPass] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [u, t] = await Promise.all([
          api<{ users: UserRow[] }>("/api/admin/users"),
          api<{ tambangan: TambanganRow[] }>("/api/admin/tambangan"),
        ]);
        if (alive) { setUsers(u.users); setTambanganList(t.tambangan); }
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

  async function handleAssignTambangan(userId: number, tambanganId: number | null) {
    try {
      await api(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ tambanganId }),
      });
      setTick((t) => t + 1);
    } catch {
      setError("Gagal assign tambangan");
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
    return <p className="py-12 text-center text-sm text-[var(--color-text-secondary)]">Memuat…</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">
          Semua Pengguna · <span className="text-[var(--color-text)]">{users.length}</span>
        </h2>
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)] text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {users.map((u) => (
              <Fragment key={u.id}>
                <tr key={u.id} className="hover:bg-[var(--color-bg)]">
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">{u.username}</td>
                  <td className="px-4 py-3">
                    {u.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        <Shield size={11} /> Admin
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-secondary)]">Nahkoda</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
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
                        className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                        title="Reset Password"
                      >
                        <RotateCcw size={14} />
                      </button>
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleDelete(u.id, u.username)}
                          className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === u.id && (
                  <tr key={`${u.id}-expand`} className="bg-blue-50/50 dark:bg-blue-900/20">
                    <td colSpan={4} className="px-4 py-3">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-medium text-[var(--color-text-secondary)]">Password baru:</span>
                          <input
                            type="password"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            placeholder="••••••••"
                            className="w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                          />
                          <button
                            onClick={() => handleResetPassword(u.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700"
                          >
                            <Save size={12} /> Reset Password
                          </button>
                        </div>
                        {u.role === "nahkoda" && (
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs font-medium text-[var(--color-text-secondary)]">Tambangan:</span>
                            <select
                              value={u.tambanganId ?? ""}
                              onChange={(e) => handleAssignTambangan(u.id, e.target.value ? Number(e.target.value) : null)}
                              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-teal-500"
                            >
                              <option value="">Belum diassign</option>
                              {tambanganList.map((t) => (
                                <option key={t.id} value={t.id}>{t.nama}</option>
                              ))}
                            </select>
                          </div>
                        )}
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
          <div key={u.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[var(--color-text)]">{u.username}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
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
              <div className="mt-3 flex gap-2 border-t border-[var(--color-border)] pt-3">
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Password baru"
                  className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)]"
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
    return <p className="py-12 text-center text-sm text-[var(--color-text-secondary)]">Memuat…</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">
          Semua Tambangan · <span className="text-[var(--color-text)]">{list.length}</span>
        </h2>
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)] text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Titik A</th>
              <th className="px-4 py-3">Titik B</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {list.map((t) => (
              <Fragment key={t.slug}>
                <tr key={t.slug} className="hover:bg-[var(--color-bg)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Anchor size={14} className="shrink-0 text-teal-500" />
                      <span className="font-medium text-[var(--color-text)]">{t.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {t.titik_a_nama}
                    {t.titik_a_lat != null && (
                      <span className="ml-1 text-xs opacity-60">
                        ({t.titik_a_lat.toFixed(3)}, {t.titik_a_lng?.toFixed(3)})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {t.titik_b_nama}
                    {t.titik_b_lat != null && (
                      <span className="ml-1 text-xs opacity-60">
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
                        className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.slug, t.nama)}
                        className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedSlug === t.slug && (
                  <tr key={`${t.slug}-expand`} className="bg-blue-50/50 dark:bg-blue-900/20">
                    <td colSpan={4} className="px-4 py-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-700 dark:text-teal-400">Edit Tambangan</span>
                          <button onClick={() => setExpandedSlug(null)} className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]">
                            <X size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                          <div className="col-span-2 lg:col-span-3">
                            <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Nama</label>
                            <input
                              value={editForm.nama}
                              onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Titik A Nama</label>
                            <input
                              value={editForm.titik_a_nama}
                              onChange={(e) => setEditForm({ ...editForm, titik_a_nama: e.target.value })}
                              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Titik A Lat</label>
                            <input
                              value={editForm.titik_a_lat}
                              onChange={(e) => setEditForm({ ...editForm, titik_a_lat: e.target.value })}
                              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Titik A Lng</label>
                            <input
                              value={editForm.titik_a_lng}
                              onChange={(e) => setEditForm({ ...editForm, titik_a_lng: e.target.value })}
                              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Titik B Nama</label>
                            <input
                              value={editForm.titik_b_nama}
                              onChange={(e) => setEditForm({ ...editForm, titik_b_nama: e.target.value })}
                              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Titik B Lat</label>
                            <input
                              value={editForm.titik_b_lat}
                              onChange={(e) => setEditForm({ ...editForm, titik_b_lat: e.target.value })}
                              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Titik B Lng</label>
                            <input
                              value={editForm.titik_b_lng}
                              onChange={(e) => setEditForm({ ...editForm, titik_b_lng: e.target.value })}
                              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
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
          <div key={t.slug} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-sm">
            {expandedSlug === t.slug ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-400">Edit Tambangan</p>
                  <button onClick={() => setExpandedSlug(null)} className="text-[var(--color-text-secondary)]">
                    <X size={14} />
                  </button>
                </div>
                <input
                  value={editForm.nama}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  placeholder="Nama"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={editForm.titik_a_nama}
                    onChange={(e) => setEditForm({ ...editForm, titik_a_nama: e.target.value })}
                    placeholder="Titik A nama"
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)]"
                  />
                  <input
                    value={editForm.titik_b_nama}
                    onChange={(e) => setEditForm({ ...editForm, titik_b_nama: e.target.value })}
                    placeholder="Titik B nama"
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={editForm.titik_a_lat}
                    onChange={(e) => setEditForm({ ...editForm, titik_a_lat: e.target.value })}
                    placeholder="Titik A lat"
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)]"
                  />
                  <input
                    value={editForm.titik_a_lng}
                    onChange={(e) => setEditForm({ ...editForm, titik_a_lng: e.target.value })}
                    placeholder="Titik A lng"
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={editForm.titik_b_lat}
                    onChange={(e) => setEditForm({ ...editForm, titik_b_lat: e.target.value })}
                    placeholder="Titik B lat"
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)]"
                  />
                  <input
                    value={editForm.titik_b_lng}
                    onChange={(e) => setEditForm({ ...editForm, titik_b_lng: e.target.value })}
                    placeholder="Titik B lng"
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)]"
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
                    <Anchor size={14} className="text-teal-600 dark:text-teal-400" />
                    <p className="font-bold text-[var(--color-text)]">{t.nama}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
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
