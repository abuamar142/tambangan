import Link from "next/link";
import { Anchor, ChevronRight, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-teal-50 shadow-xl dark:bg-slate-900">
      <div className="bg-linear-to-b from-teal-700 to-teal-600 px-4 pb-10 pt-12 text-center text-white">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <Anchor size={28} />
        </div>
        <h1 className="mx-auto mt-3 max-w-md text-2xl font-extrabold leading-tight tracking-tight">
          Tau perahu mana yang siap, sebelum lari ke dermaga.
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-teal-100">
          Pantau status penyeberangan secara langsung — standby, menyeberang, atau standby di sisi
          lain.
        </p>
      </div>

      <div className="mx-auto -mt-5 w-full max-w-md flex-1 space-y-3 rounded-t-3xl bg-teal-50 px-4 pb-8 pt-6 dark:bg-slate-900">
        <Link
          href="/tambangan"
          className="flex w-full items-center gap-4 rounded-2xl border border-teal-100 bg-white p-4 text-left shadow-sm active:bg-teal-50 dark:border-slate-700 dark:bg-slate-800 dark:active:bg-slate-700"
        >
          <div className="rounded-xl bg-amber-500 p-3 text-white">
            <Users size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-slate-900 dark:text-slate-100">Cek Status Perahu</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Lihat kapal mana yang siap dinaiki</div>
          </div>
          <ChevronRight className="shrink-0 text-slate-300 dark:text-slate-600" size={20} />
        </Link>

        <Link
          href="/nahkoda"
          className="flex w-full items-center gap-4 rounded-2xl border border-teal-100 bg-white p-4 text-left shadow-sm active:bg-teal-50 dark:border-slate-700 dark:bg-slate-800 dark:active:bg-slate-700"
        >
          <div className="rounded-xl bg-teal-600 p-3 text-white">
            <Anchor size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-slate-900 dark:text-slate-100">Saya Nahkoda</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Update status kapal yang dijalankan</div>
          </div>
          <ChevronRight className="shrink-0 text-slate-300 dark:text-slate-600" size={20} />
        </Link>
      </div>
    </div>
  );
}
