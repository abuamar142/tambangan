import Link from "next/link";
import { Anchor, ChevronRight, Users } from "lucide-react";
import { HomeTambanganSection } from "@/components/HomeKapalSection";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="mx-auto flex min-h-screen w-full flex-col md:max-w-6xl">
        {/* Compact header with theme toggle */}
        <div className="relative bg-base-100 px-4 pt-4 md:px-6 md:pt-6">
          <div className="absolute right-4 top-4 md:right-6 md:top-6">
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
              <Anchor size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-base-content">
                TambanganTrack
              </h1>
              <p className="text-xs text-base-content/60">
                Tau perahu mana yang siap, sebelum lari ke dermaga.
              </p>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="mx-auto w-full space-y-3 px-4 pt-4 md:max-w-6xl md:grid md:grid-cols-2 md:gap-4 md:space-y-0 md:px-6">
          <Link
            href="/tambangan"
            className="group flex w-full items-center gap-4 animate-card-in rounded-xl border border-base-300 bg-base-100 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          >
            <div className="rounded-lg bg-accent p-3 text-accent-content transition group-hover:scale-105">
              <Users size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-base-content">Cek Status Perahu</div>
              <div className="text-xs leading-snug text-base-content/70 md:text-sm">
                Lihat kapal mana yang siap dinaiki
              </div>
            </div>
            <ChevronRight className="shrink-0 text-base-content/50 transition group-hover:translate-x-0.5 group-hover:text-primary" size={20} />
          </Link>

          <Link
            href="/nahkoda"
            className="group flex w-full items-center gap-4 animate-card-in rounded-xl border border-base-300 bg-base-100 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          >
            <div className="rounded-lg bg-primary p-3 text-primary-content transition group-hover:scale-105">
              <Anchor size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-base-content">Saya Nahkoda</div>
              <div className="text-xs leading-snug text-base-content/70 md:text-sm">
                Update status kapal yang dijalankan
              </div>
            </div>
            <ChevronRight className="shrink-0 text-base-content/50 transition group-hover:translate-x-0.5 group-hover:text-primary" size={20} />
          </Link>
        </div>

        <HomeTambanganSection />

        <div className="border-t border-base-300 px-4 py-6 text-center md:py-8">
          <p className="text-xs text-base-content/50">
            TambanganTrack · Transparan, real-time
          </p>
        </div>
      </div>
    </div>
  );
}
