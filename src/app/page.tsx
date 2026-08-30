import Link from "next/link";
import { Anchor, ChevronRight, Users } from "lucide-react";
import { HomeKapalSection } from "@/components/HomeKapalSection";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col md:max-w-3xl">
        {/* Hero header — teal ground with depth */}
        <div className="relative overflow-hidden bg-[var(--color-surface)] px-4 pb-10 pt-12 text-center text-[var(--color-text)] md:rounded-b-[2rem] md:px-8 md:pt-10 shadow-[var(--shadow-xl)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(13,148,136,0.25),transparent)]" />
          <div className="relative">
            <div className="absolute right-4 top-4">
              <ThemeToggle />
            </div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brand)]/15 shadow-[var(--shadow-glow-brand)] backdrop-blur-sm ring-1 ring-[var(--color-brand)]/20">
              <Anchor size={28} className="text-[var(--color-brand)]" />
            </div>
            <h1 className="mx-auto mt-4 max-w-xl text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
              Tau perahu mana yang siap, sebelum lari ke dermaga.
            </h1>
            <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-[var(--color-text-secondary)] md:text-[15px]">
              Pantau status penyeberangan secara langsung — standby, menyeberang, atau standby di sisi lain.
            </p>
          </div>
        </div>

        {/* Quick links + home section */}
        <div className="mx-auto -mt-5 w-full flex-1 space-y-3 rounded-t-3xl bg-[var(--color-bg)] px-4 pb-8 pt-6 md:mt-0 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 md:rounded-t-none md:px-6 md:py-6">
          <Link
            href="/tambangan"
            className="group flex w-full items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] active:translate-y-0"
          >
            <div className="rounded-lg bg-[var(--color-accent)] p-3 text-[var(--color-accent-foreground)] shadow-[var(--shadow-glow-amber)] transition group-hover:scale-105">
              <Users size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-[var(--color-text)]">Cek Status Perahu</div>
              <div className="text-xs leading-snug text-[var(--color-text-secondary)] md:text-sm">
                Lihat kapal mana yang siap dinaiki
              </div>
            </div>
            <ChevronRight className="shrink-0 text-[var(--color-text-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-brand)]" size={20} />
          </Link>

          <Link
            href="/nahkoda"
            className="group flex w-full items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] active:translate-y-0"
          >
            <div className="rounded-lg bg-[var(--color-brand)] p-3 text-[var(--color-brand-foreground)] shadow-[var(--shadow-glow-brand)] transition group-hover:scale-105">
              <Anchor size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-[var(--color-text)]">Saya Nahkoda</div>
              <div className="text-xs leading-snug text-[var(--color-text-secondary)] md:text-sm">
                Update status kapal yang dijalankan
              </div>
            </div>
            <ChevronRight className="shrink-0 text-[var(--color-text-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-brand)]" size={20} />
          </Link>
        </div>

        <HomeKapalSection />

        <div className="border-t border-[var(--color-border)] px-4 py-6 text-center md:py-8">
          <p className="text-xs text-[var(--color-text-muted)]">
            TambanganTrack · Transparan, real-time
          </p>
        </div>
      </div>
    </div>
  );
}
