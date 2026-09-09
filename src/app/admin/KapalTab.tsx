"use client";

import { Fragment, useEffect, useState } from "react";
import { Save, Pencil, Trash2, Anchor } from "lucide-react";
import { api } from "@/lib/client/api";
import type { KapalRow } from "./types";

export function KapalTab({ setError }: { setError: (s: string) => void }) {
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
    return <p className="py-12 text-center text-sm text-base-content/70">Memuat…</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-base-content/70">
          Semua Kapal · <span className="text-base-content">{kapalList.length}</span>
        </h2>
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md md:block">
        <table className="table table-zebra table-sm w-full text-left">
          <thead>
            <tr className="border-b border-base-300 bg-base-200 text-xs font-semibold uppercase tracking-wider text-base-content/70">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tambangan</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kapalList.map((k) => (
              <Fragment key={k.slug}>
                <tr className="hover:bg-base-200 transition-colors duration-150">
                  <td className="px-4 py-3 font-medium text-base-content">{k.nama}</td>
                  <td className="px-4 py-3">
                    <span className={`badge badge-sm ${
                      k.status === "proses"
                        ? "badge-info"
                        : "badge-success"
                    }`}>
                      {k.status === "proses" ? "Menyeberang" : `Standby`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-base-content/70">{k.tambanganNama}</td>
                  <td className="px-4 py-3 text-base-content/70">{k.ownerUsername}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setExpandedSlug(expandedSlug === k.slug ? null : k.slug);
                          setEditName(k.nama);
                          setError("");
                        }}
                        className="btn btn-ghost btn-xs text-info"
                        title="Edit Nama"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => void handleDelete(k.slug, k.nama)}
                        className="btn btn-ghost btn-xs text-error"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedSlug === k.slug && (
                  <tr className="bg-base-200">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-base-content/70">Nama baru:</span>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") void handleRename(k.slug); }}
                          className="input input-bordered input-sm w-48"
                        />
                        <button onClick={() => void handleRename(k.slug)} className="btn btn-primary btn-sm">
                          <Save size={12} /> Simpan
                        </button>
                        <button onClick={() => setExpandedSlug(null)} className="btn btn-ghost btn-xs text-base-content/70">
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
          <div key={k.slug} className="card bg-base-100 border border-base-300 shadow-sm transition-shadow hover:shadow-md p-3">
            {expandedSlug === k.slug ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-primary">Edit Nama</p>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleRename(k.slug); }}
                  className="input input-bordered input-sm w-full"
                />
                <div className="flex gap-2">
                  <button onClick={() => void handleRename(k.slug)} className="btn btn-primary btn-sm flex-1">Simpan</button>
                  <button onClick={() => setExpandedSlug(null)} className="btn btn-ghost btn-sm">Batal</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-base-content">{k.nama}</p>
                  <p className="text-xs text-base-content/70">{k.tambanganNama} · {k.ownerUsername}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setExpandedSlug(k.slug); setEditName(k.nama); }}
                    className="btn btn-ghost btn-xs btn-square text-info"
                    title="Edit Nama"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => void handleDelete(k.slug, k.nama)}
                    className="btn btn-ghost btn-xs btn-square text-error"
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
