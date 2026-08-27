import Link from "next/link";
import { Anchor, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-teal-50 px-4 py-12 dark:bg-slate-900">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg">
        <Anchor size={28} />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">404</h1>
      <p className="mt-2 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">Halaman tidak ditemukan</p>
      <p className="mt-1 max-w-md text-center text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Halaman yang kamu cari tidak ada — mungkin sudah dipindah atau link salah. Kembali ke beranda untuk melanjutkan.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-700 active:bg-teal-800"
      >
        <ArrowLeft size={16} />
        Kembali ke Beranda
      </Link>
    </div>
  );
}
