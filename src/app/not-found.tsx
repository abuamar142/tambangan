import Link from "next/link";
import { Anchor } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-200 px-4 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg">
        <Anchor size={28} />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-base-content">404</h1>
      <p className="mt-2 text-center text-sm font-semibold text-base-content">Halaman tidak ditemukan</p>
      <p className="mt-1 max-w-md text-center text-sm leading-relaxed text-base-content/60">
        Halaman yang kamu cari tidak ada — mungkin sudah dipindah atau link salah.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-content shadow-md transition hover:bg-primary/90 active:bg-primary/80"
      >
        <Anchor size={16} />
        Kembali ke Beranda
      </Link>
    </div>
  );
}
