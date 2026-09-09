"use client";

import { Fragment, useEffect, useState } from "react";
import { Anchor, Pencil, Trash2, Save, X } from "lucide-react";
import { api } from "@/lib/client/api";
import type { TambanganRow } from "./types";

export function TambanganTab({ setError }: { setError: (s: string) => void }) {
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
    return <p className="py-12 text-center text-sm text-base-content/70">Memuat…</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-base-content/70">
          Semua Tambangan · <span className="text-base-content">{list.length}</span>
        </h2>
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md md:block">
        <table className="table table-zebra table-sm w-full text-left">
          <thead>
            <tr className="border-b border-base-300 bg-base-200 text-xs font-semibold uppercase tracking-wider text-base-content/70">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Titik A</th>
              <th className="px-4 py-3">Titik B</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <Fragment key={t.slug}>
                <tr key={t.slug} className="hover:bg-base-200 transition-colors duration-150">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Anchor size={14} className="shrink-0 text-primary" />
                      <span className="font-medium text-base-content">{t.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-base-content/70">
                    {t.titik_a_nama}
                    {t.titik_a_lat != null && (
                      <span className="ml-1 text-xs opacity-60">
                        ({t.titik_a_lat.toFixed(3)}, {t.titik_a_lng?.toFixed(3)})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-base-content/70">
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
                        className="btn btn-ghost btn-xs text-info"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.slug, t.nama)}
                        className="btn btn-ghost btn-xs text-error"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedSlug === t.slug && (
                  <tr key={`${t.slug}-expand`} className="bg-base-200">
                    <td colSpan={4} className="px-4 py-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary">Edit Tambangan</span>
                          <button onClick={() => setExpandedSlug(null)} className="btn btn-ghost btn-xs btn-square">
                            <X size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                          <div className="form-control col-span-2 lg:col-span-3">
                            <label className="label">
                              <span className="label-text text-xs">Nama</span>
                            </label>
                            <input
                              value={editForm.nama}
                              onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                              className="input input-bordered input-sm w-full"
                            />
                          </div>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text text-xs">Titik A Nama</span>
                            </label>
                            <input
                              value={editForm.titik_a_nama}
                              onChange={(e) => setEditForm({ ...editForm, titik_a_nama: e.target.value })}
                              className="input input-bordered input-sm w-full"
                            />
                          </div>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text text-xs">Titik A Lat</span>
                            </label>
                            <input
                              value={editForm.titik_a_lat}
                              onChange={(e) => setEditForm({ ...editForm, titik_a_lat: e.target.value })}
                              className="input input-bordered input-sm w-full"
                            />
                          </div>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text text-xs">Titik A Lng</span>
                            </label>
                            <input
                              value={editForm.titik_a_lng}
                              onChange={(e) => setEditForm({ ...editForm, titik_a_lng: e.target.value })}
                              className="input input-bordered input-sm w-full"
                            />
                          </div>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text text-xs">Titik B Nama</span>
                            </label>
                            <input
                              value={editForm.titik_b_nama}
                              onChange={(e) => setEditForm({ ...editForm, titik_b_nama: e.target.value })}
                              className="input input-bordered input-sm w-full"
                            />
                          </div>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text text-xs">Titik B Lat</span>
                            </label>
                            <input
                              value={editForm.titik_b_lat}
                              onChange={(e) => setEditForm({ ...editForm, titik_b_lat: e.target.value })}
                              className="input input-bordered input-sm w-full"
                            />
                          </div>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text text-xs">Titik B Lng</span>
                            </label>
                            <input
                              value={editForm.titik_b_lng}
                              onChange={(e) => setEditForm({ ...editForm, titik_b_lng: e.target.value })}
                              className="input input-bordered input-sm w-full"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleSave(t.slug)}
                          className="btn btn-primary"
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
          <div key={t.slug} className="card bg-base-100 border border-base-300 shadow-sm transition-shadow hover:shadow-md p-3">
            {expandedSlug === t.slug ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-primary">Edit Tambangan</p>
                  <button onClick={() => setExpandedSlug(null)} className="btn btn-ghost btn-xs btn-square">
                    <X size={14} />
                  </button>
                </div>
                <input
                  value={editForm.nama}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  placeholder="Nama"
                  className="input input-bordered input-sm w-full"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={editForm.titik_a_nama}
                    onChange={(e) => setEditForm({ ...editForm, titik_a_nama: e.target.value })}
                    placeholder="Titik A nama"
                    className="input input-bordered input-sm"
                  />
                  <input
                    value={editForm.titik_b_nama}
                    onChange={(e) => setEditForm({ ...editForm, titik_b_nama: e.target.value })}
                    placeholder="Titik B nama"
                    className="input input-bordered input-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={editForm.titik_a_lat}
                    onChange={(e) => setEditForm({ ...editForm, titik_a_lat: e.target.value })}
                    placeholder="Titik A lat"
                    className="input input-bordered input-sm"
                  />
                  <input
                    value={editForm.titik_a_lng}
                    onChange={(e) => setEditForm({ ...editForm, titik_a_lng: e.target.value })}
                    placeholder="Titik A lng"
                    className="input input-bordered input-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={editForm.titik_b_lat}
                    onChange={(e) => setEditForm({ ...editForm, titik_b_lat: e.target.value })}
                    placeholder="Titik B lat"
                    className="input input-bordered input-sm"
                  />
                  <input
                    value={editForm.titik_b_lng}
                    onChange={(e) => setEditForm({ ...editForm, titik_b_lng: e.target.value })}
                    placeholder="Titik B lng"
                    className="input input-bordered input-sm"
                  />
                </div>
                <button
                  onClick={() => handleSave(t.slug)}
                  className="btn btn-primary btn-sm w-full"
                >
                  Simpan
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Anchor size={14} className="text-primary" />
                    <p className="font-bold text-base-content">{t.nama}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-base-content/70">
                    {t.titik_a_nama} → {t.titik_b_nama}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => startEdit(t)}
                    className="btn btn-ghost btn-xs btn-square text-info"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.slug, t.nama)}
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
