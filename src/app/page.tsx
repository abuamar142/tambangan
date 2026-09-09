import Link from "next/link";
import { Anchor, ChevronRight, Users } from "lucide-react";
import { HomeKapalSection } from "@/components/HomeKapalSection";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="mx-auto flex min-h-screen w-full flex-col md:max-w-6xl">
        {/* Hero header — teal ground with depth */}
        <div className="relative overflow-hidden bg-base-100 px-4 pb-10 pt-12 text-center text-base-content md:rounded-b-[2rem] md:px-8 md:pt-10 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(13,148,136,0.25),transparent)]" />
          <div className="relative">
            <div className="absolute right-4 top-4">
              <ThemeToggle />
            </div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 backdrop-blur-sm ring-1 ring-primary/20">
              <Anchor size={28} className="text-primary" />
            </div>
            <h1 className="mx-auto mt-4 max-w-xl text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
              Tau perahu mana yang siap, sebelum lari ke dermaga.
            </h1>
            <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-base-content/70 md:text-[15px]">
              Pantau status penyeberangan secara langsung — standby, menyeberang, atau standby di sisi lain.
            </p>
          </div>
        </div>

        {/* Quick links + home section */}
        <div className="mx-auto -mt-5 w-full flex-1 space-y-3 rounded-t-3xl bg-base-100 px-4 pb-8 pt-6 md:mt-0 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 md:rounded-t-none md:px-6 md:py-8">
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

        <HomeKapalSection />

        <div className="border-t border-base-300 px-4 py-6 text-center md:py-8">
          <p className="text-xs text-base-content/50">
            TambanganTrack · Transparan, real-time
          </p>
        </div>
      </div>
    </div>
  );
}
