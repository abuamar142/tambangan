import Link from "next/link";
import { Anchor, ChevronRight, Users } from "lucide-react";
import { HomeKapalSection } from "@/components/HomeKapalSection";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] dark:bg-[var(--color-bg)]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col md:max-w-3xl">
        <div className="relative overflow-hidden bg-linear-to-b from-teal-700 via-teal-600 to-teal-600 px-4 pb-10 pt-12 text-center text-white md:rounded-b-[2rem] md:px-8 md:pt-10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-800">
          <div className="absolute right-4 top-4">
            <ThemeToggle className="border-white/20 bg-white/15 text-white hover:bg-white/25 dark:border-white/20 dark:bg-white/10 dark:text-white" />
          </div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm ring-1 ring-white/20">
            <Anchor size={28} />
          </div>
          <h1 className="mx-auto mt-4 max-w-xl text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
            Tau perahu mana yang siap, sebelum lari ke dermaga.
          </h1>
          <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-teal-100 md:text-[15px]">
            Pantau status penyeberangan secara langsung — standby, menyeberang, atau standby di sisi lain.
          </p>
        </div>

        <div className="mx-auto -mt-5 w-full flex-1 space-y-3 rounded-t-3xl bg-[var(--color-bg)] px-4 pb-8 pt-6 dark:bg-[var(--color-bg)] md:mt-0 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 md:rounded-t-none md:bg-transparent md:px-6 md:py-6 dark:md:bg-transparent">
          <Link
            href="/tambangan"
            className="group flex w-full items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:bg-teal-50 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] dark:hover:bg-slate-750 dark:active:bg-slate-700 md:p-5"
          >
            <div className="rounded-lg bg-amber-500 p-3 text-white shadow-sm transition group-hover:scale-105">
              <Users size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-[var(--color-text)] dark:text-slate-100">Cek Status Perahu</div>
              <div className="text-xs leading-snug text-[var(--color-text-secondary)] dark:text-slate-400 md:text-sm">
                Lihat kapal mana yang siap dinaiki
              </div>
            </div>
            <ChevronRight className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400 dark:text-slate-600" size={20} />
          </Link>

          <Link
            href="/nahkoda"
            className="group flex w-full items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:bg-teal-50 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] dark:hover:bg-slate-750 dark:active:bg-slate-700 md:p-5"
          >
            <div className="rounded-lg bg-teal-600 p-3 text-white shadow-sm transition group-hover:scale-105">
              <Anchor size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-[var(--color-text)] dark:text-slate-100">Saya Nahkoda</div>
              <div className="text-xs leading-snug text-[var(--color-text-secondary)] dark:text-slate-400 md:text-sm">
                Update status kapal yang dijalankan
              </div>
            </div>
            <ChevronRight className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400 dark:text-slate-600" size={20} />
          </Link>
        </div>

        <HomeKapalSection />

        <div className="border-t border-[var(--color-border)] px-4 py-6 text-center dark:border-[var(--color-border)] md:py-8">
          <p className="text-xs text-[var(--color-text-muted)] dark:text-slate-500">
            TambanganTrack · Transparan, real-time
          </p>
        </div>
      </div>
    </div>
  );
}
