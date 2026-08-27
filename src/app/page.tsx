import Link from "next/link";
import { Anchor, ChevronRight, Users } from "lucide-react";
import { HomeKapalSection } from "@/components/HomeKapalSection";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-teal-50 dark:bg-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col md:max-w-3xl">
        <div className="relative overflow-hidden bg-linear-to-b from-teal-700 via-teal-600 to-teal-600 px-4 pb-10 pt-12 text-center text-white md:rounded-b-[2rem] md:px-8 md:pt-10">
          <div className="absolute right-4 top-4">
            <ThemeToggle className="!border-white/20 !bg-white/15 !text-white hover:!bg-white/25 dark:!border-white/20 dark:!bg-white/10 dark:!text-white" />
          </div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur ring-1 ring-white/20">
            <Anchor size={28} />
          </div>
          <h1 className="mx-auto mt-4 max-w-xl text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
            Tau perahu mana yang siap, sebelum lari ke dermaga.
          </h1>
          <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-teal-100 md:text-[15px]">
            Pantau status penyeberangan secara langsung — standby, menyeberang, atau standby di sisi lain.
          </p>
        </div>

        <div className="mx-auto -mt-5 w-full flex-1 space-y-3 rounded-t-3xl bg-teal-50 px-4 pb-8 pt-6 dark:bg-slate-900 md:mt-0 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 md:rounded-t-none md:bg-transparent md:px-6 md:py-6 dark:md:bg-transparent">
          <Link
            href="/tambangan"
            className="group flex w-full items-center gap-4 rounded-2xl border border-teal-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:bg-teal-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:active:bg-slate-700 md:p-5"
          >
            <div className="rounded-xl bg-amber-500 p-3 text-white shadow-sm transition group-hover:scale-105">
              <Users size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 dark:text-slate-100">Cek Status Perahu</div>
              <div className="text-xs leading-snug text-slate-500 dark:text-slate-400 md:text-sm">
                Lihat kapal mana yang siap dinaiki
              </div>
            </div>
            <ChevronRight className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400 dark:text-slate-600" size={20} />
          </Link>

          <Link
            href="/nahkoda"
            className="group flex w-full items-center gap-4 rounded-2xl border border-teal-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:bg-teal-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:active:bg-slate-700 md:p-5"
          >
            <div className="rounded-xl bg-teal-600 p-3 text-white shadow-sm transition group-hover:scale-105">
              <Anchor size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 dark:text-slate-100">Saya Nahkoda</div>
              <div className="text-xs leading-snug text-slate-500 dark:text-slate-400 md:text-sm">
                Update status kapal yang dijalankan
              </div>
            </div>
            <ChevronRight className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400 dark:text-slate-600" size={20} />
          </Link>
        </div>

        <HomeKapalSection />

        <p className="pb-6 text-center text-xs text-slate-400 dark:text-slate-500 md:pb-8">
          TambanganTrack · Transparan, real-time
        </p>
      </div>
    </div>
  );
}
