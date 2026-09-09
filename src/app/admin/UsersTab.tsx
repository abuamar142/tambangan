"use client";

import { Fragment, useEffect, useState } from "react";
import { Shield, RotateCcw, Trash2, Save } from "lucide-react";
import { api } from "@/lib/client/api";
import type { UserRow, TambanganRow } from "./types";

export function UsersTab({ setError }: { setError: (s: string) => void }) {
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
    return <p className="py-12 text-center text-sm text-base-content/70">Memuat…</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-base-content/70">
          Semua Pengguna · <span className="text-base-content">{users.length}</span>
        </h2>
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md md:block">
        <table className="table table-zebra table-sm w-full text-left">
          <thead>
            <tr className="border-b border-base-300 bg-base-200 text-xs font-semibold uppercase tracking-wider text-base-content/70">
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <Fragment key={u.id}>
                <tr key={u.id} className="hover:bg-base-200 transition-colors duration-150">
                  <td className="px-4 py-3 font-medium text-base-content">{u.username}</td>
                  <td className="px-4 py-3">
                    {u.role === "admin" ? (
                      <span className="badge badge-accent badge-sm">
                        <Shield size={11} /> Admin
                      </span>
                    ) : (
                      <span className="text-base-content/70">Nahkoda</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-base-content/70">
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
                        className="btn btn-ghost btn-xs text-info"
                        title="Reset Password"
                      >
                        <RotateCcw size={14} />
                      </button>
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleDelete(u.id, u.username)}
                          className="btn btn-ghost btn-xs text-error"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === u.id && (
                  <tr key={`${u.id}-expand`} className="bg-base-200">
                    <td colSpan={4} className="px-4 py-3">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-medium text-base-content/70">Password baru:</span>
                          <input
                            type="password"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            placeholder="••••••••"
                            className="input input-bordered input-sm w-48"
                          />
                          <button
                            onClick={() => handleResetPassword(u.id)}
                            className="btn btn-primary btn-sm"
                          >
                            <Save size={12} /> Reset Password
                          </button>
                        </div>
                        {u.role === "nahkoda" && (
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs font-medium text-base-content/70">Tambangan:</span>
                            <select
                              value={u.tambanganId ?? ""}
                              onChange={(e) => handleAssignTambangan(u.id, e.target.value ? Number(e.target.value) : null)}
                              className="select select-bordered select-sm"
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
          <div key={u.id} className="card bg-base-100 border border-base-300 shadow-sm transition-shadow hover:shadow-md p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-base-content">{u.username}</p>
                <p className="text-xs text-base-content/70">
                  {u.role === "admin" ? (
                    <span className="flex items-center gap-1 text-accent font-semibold">
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
                  className="btn btn-ghost btn-xs btn-square text-info"
                  title="Reset Password"
                >
                  <RotateCcw size={14} />
                </button>
                {u.role !== "admin" && (
                  <button
                    onClick={() => handleDelete(u.id, u.username)}
                    className="btn btn-ghost btn-xs btn-square text-error"
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            {expandedId === u.id && (
              <div className="mt-3 flex gap-2 border-t border-base-300 pt-3">
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Password baru"
                  className="input input-bordered input-sm flex-1"
                />
                <button
                  onClick={() => handleResetPassword(u.id)}
                  className="btn btn-primary btn-square btn-sm"
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
