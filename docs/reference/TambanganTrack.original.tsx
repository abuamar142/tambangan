import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Anchor,
  MapPin,
  Clock,
  RefreshCw,
  ArrowLeft,
  Plus,
  ChevronRight,
  Users,
  Navigation,
  Loader2,
  AlertCircle,
} from 'lucide-react';

/* ---------------- pure helpers ---------------- */

function slugify(str) {
  const s = (str || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
  return s || `x${Date.now()}`;
}

function haversineMeters(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => v === null || v === undefined)) return null;
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function timeAgo(ts) {
  if (!ts) return '-';
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 5) return 'baru saja';
  if (s < 60) return `${s} detik lalu`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  return `${h} jam lalu`;
}

function minutesLeft(timerEndAt) {
  if (!timerEndAt) return null;
  const diffMs = timerEndAt - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / 60000);
}

function sortByTimer(a, b) {
  if (a.timerEndAt && b.timerEndAt) return a.timerEndAt - b.timerEndAt;
  if (a.timerEndAt) return -1;
  if (b.timerEndAt) return 1;
  return 0;
}

async function sGet(key) {
  try {
    const res = await window.storage.get(key, true);
    return res ? JSON.parse(res.value) : null;
  } catch (e) {
    return null;
  }
}

async function sSet(key, value) {
  try {
    const res = await window.storage.set(key, JSON.stringify(value), true);
    return !!res;
  } catch (e) {
    return false;
  }
}

function stripMeta(obj) {
  const { tambanganSlug, kapalSlug, ...rest } = obj;
  return rest;
}

/* ---------------- small presentational pieces ---------------- */

function ChannelBar({ status, compact }) {
  const dotColor = status === 'proses' ? 'bg-blue-600' : 'bg-emerald-600';
  const left = status === 'titik_a' ? '4%' : status === 'proses' ? '50%' : '96%';
  return (
    <div
      className={`relative ${compact ? 'h-1.5' : 'h-2'} w-full rounded-full bg-gradient-to-r from-emerald-200 via-teal-100 to-emerald-200`}
    >
      <div
        className={`absolute top-1/2 rounded-full border-2 border-white shadow-sm transition-all duration-700 motion-reduce:transition-none ${dotColor} ${
          compact ? 'h-3.5 w-3.5' : 'h-5 w-5'
        } ${status === 'proses' ? 'animate-pulse motion-reduce:animate-none' : ''}`}
        style={{ left, transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
}

function StatusBadge({ status, titikA, titikB }) {
  if (status === 'proses') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
        <Navigation size={14} />
        Menyeberang
      </span>
    );
  }
  const label = status === 'titik_a' ? titikA?.nama : titikB?.nama;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Standby di {label}
    </span>
  );
}

function ScreenHeader({ title, subtitle, onBack }) {
  return (
    <div className="flex items-center gap-3 border-b border-teal-100 bg-white px-4 py-3">
      {onBack && (
        <button
          onClick={onBack}
          className="rounded-full p-1.5 text-teal-700 hover:bg-teal-50 active:bg-teal-100"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <div className="min-w-0">
        <h1 className="truncate text-base font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function ErrorNote({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function KapalGroup({ label, items }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
        {label} · {items.length}
      </p>
      <div className="space-y-2">
        {items.map((k) => {
          const mins = minutesLeft(k.timerEndAt);
          return (
            <div key={k.slug} className="rounded-xl border border-teal-100 bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-slate-900">
                  <Anchor size={15} className="text-teal-600" />
                  {k.namaKapal}
                </span>
                <span className="font-mono text-xs text-slate-400">{timeAgo(k.lastUpdated)}</span>
              </div>
              <div className="mt-2.5">
                <ChannelBar status={k.status} compact />
              </div>
              {mins !== null && (
                <p className="mt-2 font-mono text-xs font-semibold text-amber-700">
                  ~{mins} menit lagi berangkat
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- main app ---------------- */

export default function TambanganTrack() {
  const [screen, setScreen] = useState('home');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [, forceTick] = useState(0);

  const [tambanganList, setTambanganList] = useState([]);
  const [tambanganLoading, setTambanganLoading] = useState(false);

  const [currentKapal, setCurrentKapal] = useState(null);

  const [formTambangan, setFormTambangan] = useState('');
  const [formKapal, setFormKapal] = useState('');
  const [formTitikA, setFormTitikA] = useState('Jatikalen');
  const [formTitikB, setFormTitikB] = useState('Megaluh');
  const [formTitikACoord, setFormTitikACoord] = useState(null);
  const [formTitikBCoord, setFormTitikBCoord] = useState(null);
  const [gettingLoc, setGettingLoc] = useState(null);

  const [resumeTambangan, setResumeTambangan] = useState(null);
  const [resumeKapalList, setResumeKapalList] = useState([]);

  const [selectedTambangan, setSelectedTambangan] = useState(null);
  const [customerKapalList, setCustomerKapalList] = useState([]);

  const [timerInput, setTimerInput] = useState('');
  const [gpsDist, setGpsDist] = useState({ a: null, b: null });
  const [gpsError, setGpsError] = useState('');

  const watchIdRef = useRef(null);
  const lastGpsWriteRef = useRef(0);
  const pollRef = useRef(null);

  // re-render periodically so "x menit lalu" / countdowns stay fresh
  useEffect(() => {
    const t = setInterval(() => forceTick((x) => x + 1), 15000);
    return () => clearInterval(t);
  }, []);

  const loadTambanganList = useCallback(async () => {
    setTambanganLoading(true);
    const data = await sGet('tambangan-list');
    setTambanganList(Array.isArray(data) ? data : []);
    setTambanganLoading(false);
  }, []);

  useEffect(() => {
    if (screen === 'nahkoda-new' || screen === 'nahkoda-resume' || screen === 'customer-select') {
      loadTambanganList();
    }
  }, [screen, loadTambanganList]);

  async function persistKapal(updated) {
    const dataKey = `kapal-data:${updated.tambanganSlug}:${updated.kapalSlug}`;
    await sSet(dataKey, stripMeta(updated));
  }

  async function handleRegisterKapal() {
    setErrorMsg('');
    if (!formTambangan.trim() || !formKapal.trim()) {
      setErrorMsg('Nama tambangan dan nama kapal wajib diisi.');
      return;
    }
    setLoading(true);
    const tambanganSlug = slugify(formTambangan);
    const kapalSlug = slugify(formKapal);

    const existingTambangan = (await sGet('tambangan-list')) || [];
    if (!existingTambangan.some((t) => t.slug === tambanganSlug)) {
      await sSet('tambangan-list', [
        ...existingTambangan,
        { slug: tambanganSlug, nama: formTambangan.trim() },
      ]);
    }

    const registryKey = `kapal-registry:${tambanganSlug}`;
    const existingKapal = (await sGet(registryKey)) || [];
    if (!existingKapal.some((k) => k.slug === kapalSlug)) {
      await sSet(registryKey, [...existingKapal, { slug: kapalSlug, nama: formKapal.trim() }]);
    }

    const dataKey = `kapal-data:${tambanganSlug}:${kapalSlug}`;
    let kapalData = await sGet(dataKey);
    if (!kapalData) {
      kapalData = {
        namaKapal: formKapal.trim(),
        tambanganNama: formTambangan.trim(),
        titikA: {
          nama: formTitikA.trim() || 'Titik A',
          lat: formTitikACoord ? formTitikACoord.lat : null,
          lng: formTitikACoord ? formTitikACoord.lng : null,
        },
        titikB: {
          nama: formTitikB.trim() || 'Titik B',
          lat: formTitikBCoord ? formTitikBCoord.lat : null,
          lng: formTitikBCoord ? formTitikBCoord.lng : null,
        },
        status: 'titik_a',
        mode: 'manual',
        timerEndAt: null,
        lastUpdated: Date.now(),
      };
      await sSet(dataKey, kapalData);
    }

    setCurrentKapal({ tambanganSlug, kapalSlug, ...kapalData });
    setLoading(false);
    setScreen('nahkoda-control');
  }

  async function openResumeTambangan(t) {
    setResumeTambangan(t);
    setLoading(true);
    const list = (await sGet(`kapal-registry:${t.slug}`)) || [];
    setResumeKapalList(list);
    setLoading(false);
  }

  async function resumeKapal(k) {
    setLoading(true);
    const dataKey = `kapal-data:${resumeTambangan.slug}:${k.slug}`;
    const data = await sGet(dataKey);
    setLoading(false);
    if (data) {
      setCurrentKapal({ tambanganSlug: resumeTambangan.slug, kapalSlug: k.slug, ...data });
      setScreen('nahkoda-control');
    } else {
      setErrorMsg('Data kapal tidak ditemukan. Mungkin sudah dihapus.');
    }
  }

  async function updateStatus(newStatus) {
    if (!currentKapal) return;
    const updated = { ...currentKapal, status: newStatus, timerEndAt: null, lastUpdated: Date.now() };
    setCurrentKapal(updated);
    await persistKapal(updated);
  }

  async function setMode(mode) {
    if (!currentKapal) return;
    const updated = { ...currentKapal, mode, lastUpdated: Date.now() };
    setCurrentKapal(updated);
    await persistKapal(updated);
  }

  async function applyTimer(minutes) {
    if (!currentKapal || !minutes) return;
    const timerEndAt = Date.now() + minutes * 60000;
    const updated = { ...currentKapal, timerEndAt, lastUpdated: Date.now() };
    setCurrentKapal(updated);
    await persistKapal(updated);
    setTimerInput('');
  }

  async function clearTimer() {
    if (!currentKapal) return;
    const updated = { ...currentKapal, timerEndAt: null, lastUpdated: Date.now() };
    setCurrentKapal(updated);
    await persistKapal(updated);
  }

  function captureFormLocation(which) {
    if (!('geolocation' in navigator)) {
      setErrorMsg('Perangkat/browser ini tidak mendukung GPS.');
      return;
    }
    setGettingLoc(which);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coord = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (which === 'A') setFormTitikACoord(coord);
        else setFormTitikBCoord(coord);
        setGettingLoc(null);
      },
      () => {
        setErrorMsg('Gagal mengambil lokasi. Bisa dilanjutkan dulu, lokasi diatur belakangan.');
        setGettingLoc(null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function captureControlLocation(which) {
    if (!('geolocation' in navigator) || !currentKapal) return;
    setGettingLoc(which);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coord = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const updated = { ...currentKapal };
        if (which === 'A') updated.titikA = { ...updated.titikA, ...coord };
        else updated.titikB = { ...updated.titikB, ...coord };
        setCurrentKapal(updated);
        await persistKapal(updated);
        setGettingLoc(null);
      },
      () => {
        setGpsError('Gagal mengambil lokasi.');
        setGettingLoc(null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // GPS auto-mode: watch position, infer status from distance to titik A/B
  useEffect(() => {
    if (screen !== 'nahkoda-control' || !currentKapal || currentKapal.mode !== 'gps') {
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }
    if (!('geolocation' in navigator)) {
      setGpsError('GPS tidak didukung di perangkat ini.');
      return;
    }
    setGpsError('');
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentKapal((prev) => {
          if (!prev) return prev;
          const distA = haversineMeters(latitude, longitude, prev.titikA.lat, prev.titikA.lng);
          const distB = haversineMeters(latitude, longitude, prev.titikB.lat, prev.titikB.lng);
          setGpsDist({ a: distA, b: distB });

          const THRESHOLD = 150;
          let newStatus = prev.status;
          if (distA !== null && distA < THRESHOLD) newStatus = 'titik_a';
          else if (distB !== null && distB < THRESHOLD) newStatus = 'titik_b';
          else if (distA !== null || distB !== null) newStatus = 'proses';

          const now = Date.now();
          const shouldWrite = newStatus !== prev.status || now - lastGpsWriteRef.current > 20000;
          if (!shouldWrite) return prev;

          lastGpsWriteRef.current = now;
          const updated = {
            ...prev,
            status: newStatus,
            lastUpdated: now,
            ...(newStatus !== prev.status ? { timerEndAt: null } : {}),
          };
          persistKapal(updated);
          return updated;
        });
      },
      (err) => setGpsError('Gagal melacak GPS: ' + err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [screen, currentKapal?.mode, currentKapal?.kapalSlug]);

  async function openTambanganCustomer(t) {
    setSelectedTambangan(t);
    setScreen('customer-list');
    await loadCustomerKapal(t);
  }

  const loadCustomerKapal = useCallback(async (t) => {
    setLoading(true);
    const list = (await sGet(`kapal-registry:${t.slug}`)) || [];
    const results = await Promise.all(
      list.map(async (k) => {
        const data = await sGet(`kapal-data:${t.slug}:${k.slug}`);
        return data ? { slug: k.slug, ...data } : null;
      })
    );
    setCustomerKapalList(results.filter(Boolean));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (screen === 'customer-list' && selectedTambangan) {
      pollRef.current = setInterval(() => loadCustomerKapal(selectedTambangan), 5000);
      return () => clearInterval(pollRef.current);
    }
  }, [screen, selectedTambangan, loadCustomerKapal]);

  function exitNahkoda() {
    setCurrentKapal(null);
    setGpsError('');
    setGpsDist({ a: null, b: null });
    setScreen('home');
  }

  /* ---------------- screens ---------------- */

  function renderHome() {
    return (
      <div className="flex flex-1 flex-col">
        <div className="bg-gradient-to-b from-teal-700 to-teal-600 px-6 pb-8 pt-10 text-white">
          <div className="mx-auto flex max-w-md items-center gap-2">
            <Anchor size={22} />
            <span className="text-xs font-semibold uppercase tracking-widest text-teal-100">
              Tambangan Track
            </span>
          </div>
          <h1 className="mx-auto mt-3 max-w-md text-2xl font-extrabold leading-tight tracking-tight">
            Tau perahu mana yang siap, sebelum lari ke dermaga.
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-teal-100">
            Pantau status penyeberangan secara langsung — standby, menyeberang, atau standby di
            sisi lain.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <ChannelBar status="proses" />
            <div className="mt-1 flex justify-between font-mono text-xs text-teal-100">
              <span>Sisi A</span>
              <span>Sisi B</span>
            </div>
          </div>
        </div>

        <div className="mx-auto -mt-4 w-full max-w-md flex-1 space-y-3 rounded-t-3xl bg-teal-50 px-4 pb-8 pt-6">
          <ErrorNote message={errorMsg} />

          <button
            onClick={() => {
              setErrorMsg('');
              setScreen('nahkoda-choice');
            }}
            className="flex w-full items-center gap-4 rounded-2xl border border-teal-100 bg-white p-4 text-left shadow-sm active:bg-teal-50"
          >
            <div className="rounded-xl bg-teal-600 p-3 text-white">
              <Anchor size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900">Saya Nahkoda</div>
              <div className="text-xs text-slate-500">Update status kapal yang dijalankan</div>
            </div>
            <ChevronRight className="shrink-0 text-slate-300" size={20} />
          </button>

          <button
            onClick={() => {
              setErrorMsg('');
              setScreen('customer-select');
            }}
            className="flex w-full items-center gap-4 rounded-2xl border border-teal-100 bg-white p-4 text-left shadow-sm active:bg-teal-50"
          >
            <div className="rounded-xl bg-amber-500 p-3 text-white">
              <Users size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900">Cek Status Perahu</div>
              <div className="text-xs text-slate-500">Lihat kapal mana yang siap dinaiki</div>
            </div>
            <ChevronRight className="shrink-0 text-slate-300" size={20} />
          </button>

          <p className="pt-2 text-center text-xs text-slate-400">
            Data status dibagikan ke semua pengguna tautan ini.
          </p>
        </div>
      </div>
    );
  }

  function renderNahkodaChoice() {
    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader
          title="Nahkoda"
          subtitle="Pilih kapal yang mau dikendalikan"
          onBack={() => setScreen('home')}
        />
        <div className="mx-auto w-full max-w-md flex-1 space-y-3 p-4">
          <button
            onClick={() => {
              setErrorMsg('');
              setScreen('nahkoda-new');
            }}
            className="flex w-full items-center gap-4 rounded-2xl border border-teal-100 bg-white p-4 text-left shadow-sm active:bg-teal-50"
          >
            <div className="rounded-xl bg-teal-600 p-3 text-white">
              <Plus size={20} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-900">Daftar Kapal Baru</div>
              <div className="text-xs text-slate-500">Kapal ini belum pernah didaftarkan</div>
            </div>
            <ChevronRight className="text-slate-300" size={20} />
          </button>

          <button
            onClick={() => {
              setErrorMsg('');
              setResumeTambangan(null);
              setResumeKapalList([]);
              setScreen('nahkoda-resume');
            }}
            className="flex w-full items-center gap-4 rounded-2xl border border-teal-100 bg-white p-4 text-left shadow-sm active:bg-teal-50"
          >
            <div className="rounded-xl bg-slate-700 p-3 text-white">
              <RefreshCw size={20} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-900">Lanjutkan Kapal Terdaftar</div>
              <div className="text-xs text-slate-500">Kapal sudah pernah didaftarkan sebelumnya</div>
            </div>
            <ChevronRight className="text-slate-300" size={20} />
          </button>
        </div>
      </div>
    );
  }

  function renderNahkodaNew() {
    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader
          title="Daftar Kapal Baru"
          subtitle="Isi sekali saja, bisa dilanjutkan lain waktu"
          onBack={() => setScreen('nahkoda-choice')}
        />
        <div className="mx-auto w-full max-w-md flex-1 space-y-4 p-4">
          <ErrorNote message={errorMsg} />

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Nama Tambangan
            </label>
            <input
              value={formTambangan}
              onChange={(e) => setFormTambangan(e.target.value)}
              list="tambangan-suggestions"
              placeholder="mis. Jatikalen-Megaluh"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
            <datalist id="tambangan-suggestions">
              {tambanganList.map((t) => (
                <option key={t.slug} value={t.nama} />
              ))}
            </datalist>
            <p className="mt-1 text-xs text-slate-400">Pilih yang sudah ada, atau ketik nama baru.</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Nama Kapal
            </label>
            <input
              value={formKapal}
              onChange={(e) => setFormKapal(e.target.value)}
              placeholder="mis. Perahu Barokah"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Titik A
              </label>
              <input
                value={formTitikA}
                onChange={(e) => setFormTitikA(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
              <button
                onClick={() => captureFormLocation('A')}
                disabled={gettingLoc === 'A'}
                className="mt-1.5 flex items-center gap-1 text-xs font-medium text-teal-700"
              >
                {gettingLoc === 'A' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <MapPin size={12} />
                )}
                {formTitikACoord ? 'Lokasi tersimpan' : 'Pakai lokasi sekarang'}
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Titik B
              </label>
              <input
                value={formTitikB}
                onChange={(e) => setFormTitikB(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
              <button
                onClick={() => captureFormLocation('B')}
                disabled={gettingLoc === 'B'}
                className="mt-1.5 flex items-center gap-1 text-xs font-medium text-teal-700"
              >
                {gettingLoc === 'B' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <MapPin size={12} />
                )}
                {formTitikBCoord ? 'Lokasi tersimpan' : 'Pakai lokasi sekarang'}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Lokasi GPS opsional — hanya dipakai kalau mode GPS otomatis diaktifkan nanti. Boleh
            dilewati dulu.
          </p>

          <button
            onClick={handleRegisterKapal}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-bold text-white shadow-sm active:bg-teal-700 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Simpan &amp; Mulai
          </button>
        </div>
      </div>
    );
  }

  function renderNahkodaResume() {
    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader
          title="Lanjutkan Kapal"
          subtitle={resumeTambangan ? resumeTambangan.nama : 'Pilih tambangan dulu'}
          onBack={() => (resumeTambangan ? setResumeTambangan(null) : setScreen('nahkoda-choice'))}
        />
        <div className="mx-auto w-full max-w-md flex-1 space-y-2 p-4">
          <ErrorNote message={errorMsg} />

          {!resumeTambangan && (
            <>
              {tambanganLoading && (
                <p className="p-4 text-center text-sm text-slate-400">Memuat…</p>
              )}
              {!tambanganLoading && tambanganList.length === 0 && (
                <p className="p-4 text-center text-sm text-slate-400">
                  Belum ada tambangan terdaftar. Daftar kapal baru dulu, yuk.
                </p>
              )}
              {!tambanganLoading &&
                tambanganList.map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => openResumeTambangan(t)}
                    className="flex w-full items-center justify-between rounded-xl border border-teal-100 bg-white p-3.5 text-left shadow-sm active:bg-teal-50"
                  >
                    <span className="font-medium text-slate-900">{t.nama}</span>
                    <ChevronRight className="text-slate-300" size={18} />
                  </button>
                ))}
            </>
          )}

          {resumeTambangan && (
            <>
              {loading && <p className="p-4 text-center text-sm text-slate-400">Memuat daftar kapal…</p>}
              {!loading && resumeKapalList.length === 0 && (
                <p className="p-4 text-center text-sm text-slate-400">Belum ada kapal di tambangan ini.</p>
              )}
              {!loading &&
                resumeKapalList.map((k) => (
                  <button
                    key={k.slug}
                    onClick={() => resumeKapal(k)}
                    className="flex w-full items-center justify-between rounded-xl border border-teal-100 bg-white p-3.5 text-left shadow-sm active:bg-teal-50"
                  >
                    <span className="flex items-center gap-2 font-medium text-slate-900">
                      <Anchor size={16} className="text-teal-600" />
                      {k.nama}
                    </span>
                    <ChevronRight className="text-slate-300" size={18} />
                  </button>
                ))}
            </>
          )}
        </div>
      </div>
    );
  }

  function renderNahkodaControl() {
    if (!currentKapal) return null;
    const mins = minutesLeft(currentKapal.timerEndAt);
    const showTimer = currentKapal.status === 'titik_a' || currentKapal.status === 'titik_b';

    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader
          title={currentKapal.namaKapal}
          subtitle={currentKapal.tambanganNama}
          onBack={exitNahkoda}
        />
        <div className="mx-auto w-full max-w-md flex-1 space-y-5 p-4">
          <div className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <StatusBadge
                status={currentKapal.status}
                titikA={currentKapal.titikA}
                titikB={currentKapal.titikB}
              />
              <span className="font-mono text-xs text-slate-400">
                {timeAgo(currentKapal.lastUpdated)}
              </span>
            </div>
            <div className="mt-4">
              <ChannelBar status={currentKapal.status} />
              <div className="mt-1 flex justify-between font-mono text-xs text-slate-500">
                <span>{currentKapal.titikA.nama}</span>
                <span>{currentKapal.titikB.nama}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex gap-2">
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold ${
                  currentKapal.mode !== 'gps'
                    ? 'bg-teal-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-500'
                }`}
              >
                Mode Manual
              </button>
              <button
                onClick={() => setMode('gps')}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold ${
                  currentKapal.mode === 'gps'
                    ? 'bg-teal-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-500'
                }`}
              >
                Mode GPS Otomatis
              </button>
            </div>

            {currentKapal.mode !== 'gps' && (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateStatus('titik_a')}
                  className={`rounded-xl py-3 text-xs font-bold ${
                    currentKapal.status === 'titik_a'
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {currentKapal.titikA.nama}
                </button>
                <button
                  onClick={() => updateStatus('proses')}
                  className={`rounded-xl py-3 text-xs font-bold ${
                    currentKapal.status === 'proses'
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  Proses ⛵
                </button>
                <button
                  onClick={() => updateStatus('titik_b')}
                  className={`rounded-xl py-3 text-xs font-bold ${
                    currentKapal.status === 'titik_b'
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {currentKapal.titikB.nama}
                </button>
              </div>
            )}

            {currentKapal.mode === 'gps' && (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
                {gpsError && <p className="text-xs text-red-600">{gpsError}</p>}
                <p className="flex items-center justify-between font-mono text-xs text-slate-600">
                  <span>{currentKapal.titikA.nama}</span>
                  <span>{gpsDist.a !== null ? `${Math.round(gpsDist.a)} m` : '—'}</span>
                </p>
                <p className="flex items-center justify-between font-mono text-xs text-slate-600">
                  <span>{currentKapal.titikB.nama}</span>
                  <span>{gpsDist.b !== null ? `${Math.round(gpsDist.b)} m` : '—'}</span>
                </p>
                <div className="flex gap-2 pt-1">
                  {currentKapal.titikA.lat === null && (
                    <button
                      onClick={() => captureControlLocation('A')}
                      className="flex-1 rounded-lg bg-teal-50 py-1.5 text-xs font-semibold text-teal-700"
                    >
                      Set lokasi {currentKapal.titikA.nama}
                    </button>
                  )}
                  {currentKapal.titikB.lat === null && (
                    <button
                      onClick={() => captureControlLocation('B')}
                      className="flex-1 rounded-lg bg-teal-50 py-1.5 text-xs font-semibold text-teal-700"
                    >
                      Set lokasi {currentKapal.titikB.nama}
                    </button>
                  )}
                </div>
                <p className="pt-1 text-xs text-slate-400">
                  Status terupdate otomatis dari GPS. Fitur ini eksperimental — kalau sinyal lemah,
                  pakai mode manual saja.
                </p>
              </div>
            )}
          </div>

          {showTimer && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Clock size={16} />
                Estimasi berangkat lagi
              </div>
              {mins !== null ? (
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-amber-800">{mins} menit</span>
                  <button
                    onClick={clearTimer}
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm"
                  >
                    Hapus Timer
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    {[5, 10, 15].map((m) => (
                      <button
                        key={m}
                        onClick={() => applyTimer(m)}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-sm"
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                  <input
                    value={timerInput}
                    onChange={(e) => setTimerInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="lainnya"
                    className="w-16 rounded-lg border border-amber-200 px-2 py-1.5 text-xs"
                  />
                  <button
                    onClick={() => applyTimer(parseInt(timerInput, 10))}
                    disabled={!timerInput}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Set
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderCustomerSelect() {
    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader
          title="Pilih Tambangan"
          subtitle="Lokasi penyeberangan yang mau dicek"
          onBack={() => setScreen('home')}
        />
        <div className="mx-auto w-full max-w-md flex-1 space-y-2 p-4">
          {tambanganLoading && <p className="p-4 text-center text-sm text-slate-400">Memuat…</p>}
          {!tambanganLoading && tambanganList.length === 0 && (
            <p className="p-4 text-center text-sm text-slate-400">
              Belum ada tambangan terdaftar. Minta nahkoda mendaftarkan kapalnya dulu.
            </p>
          )}
          {!tambanganLoading &&
            tambanganList.map((t) => (
              <button
                key={t.slug}
                onClick={() => openTambanganCustomer(t)}
                className="flex w-full items-center justify-between rounded-xl border border-teal-100 bg-white p-3.5 text-left shadow-sm active:bg-teal-50"
              >
                <span className="font-medium text-slate-900">{t.nama}</span>
                <ChevronRight className="text-slate-300" size={18} />
              </button>
            ))}
        </div>
      </div>
    );
  }

  function renderCustomerList() {
    const groups = {
      titik_a: customerKapalList.filter((k) => k.status === 'titik_a').sort(sortByTimer),
      proses: customerKapalList.filter((k) => k.status === 'proses'),
      titik_b: customerKapalList.filter((k) => k.status === 'titik_b').sort(sortByTimer),
    };

    const fastest = [...groups.titik_a, ...groups.titik_b]
      .filter((k) => k.timerEndAt)
      .sort((a, b) => a.timerEndAt - b.timerEndAt)[0];

    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader
          title={selectedTambangan?.nama}
          subtitle={`${customerKapalList.length} kapal terdaftar`}
          onBack={() => setScreen('customer-select')}
        />
        <div className="mx-auto w-full max-w-md flex-1 space-y-4 p-4">
          <button
            onClick={() => loadCustomerKapal(selectedTambangan)}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-700"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Segarkan
          </button>

          {fastest && (
            <div className="rounded-2xl bg-amber-500 p-4 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-100">
                Paling cepat berangkat
              </p>
              <p className="mt-1 text-lg font-bold">{fastest.namaKapal}</p>
              <p className="font-mono text-sm text-amber-50">
                ~{minutesLeft(fastest.timerEndAt)} menit lagi, standby di{' '}
                {fastest.status === 'titik_a' ? fastest.titikA.nama : fastest.titikB.nama}
              </p>
            </div>
          )}

          {customerKapalList.length === 0 && !loading && (
            <p className="p-4 text-center text-sm text-slate-400">Belum ada kapal di tambangan ini.</p>
          )}

          {groups.titik_a.length > 0 && (
            <KapalGroup label={`Standby di ${groups.titik_a[0].titikA.nama}`} items={groups.titik_a} />
          )}
          {groups.proses.length > 0 && <KapalGroup label="Sedang Menyeberang" items={groups.proses} />}
          {groups.titik_b.length > 0 && (
            <KapalGroup label={`Standby di ${groups.titik_b[0].titikB.nama}`} items={groups.titik_b} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-50">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-teal-50 shadow-xl">
        {screen === 'home' && renderHome()}
        {screen === 'nahkoda-choice' && renderNahkodaChoice()}
        {screen === 'nahkoda-new' && renderNahkodaNew()}
        {screen === 'nahkoda-resume' && renderNahkodaResume()}
        {screen === 'nahkoda-control' && renderNahkodaControl()}
        {screen === 'customer-select' && renderCustomerSelect()}
        {screen === 'customer-list' && renderCustomerList()}
      </div>
    </div>
  );
}
