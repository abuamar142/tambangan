"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Map, Anchor } from "lucide-react";
import { ErrorNote } from "@/components/ErrorNote";
import { api } from "@/lib/client/api";
import type { UserInfo } from "@/lib/types";
import type { Tab } from "./types";
import { StatsOverview } from "./StatsOverview";
import { UsersTab } from "./UsersTab";
import { TambanganTab } from "./TambanganTab";
import { KapalTab } from "./KapalTab";

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "users", label: "Pengguna", icon: Users },
  { id: "tambangan", label: "Tambangan", icon: Map },
  { id: "kapal", label: "Kapal", icon: Anchor },
];

export default function AdminPage() {
  const router = useRouter();
  const [me, setMe] = useState<UserInfo | null>(null);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("users");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api<{ user: UserInfo | null }>("/api/auth/me")
      .then((r) => {
        if (!alive) return;
        if (!r.user || r.user.role !== "admin") {
          router.replace("/login?next=%2Fadmin");
          return;
        }
        setMe(r.user);
        setChecked(true);
      })
      .catch(() => {
        if (alive) router.replace("/login?next=%2Fadmin");
      });
    return () => { alive = false; };
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100">
        <p className="text-sm text-base-content/50">Memuat…</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Tab bar */}
      <div className="border-b border-base-300 bg-base-100 shadow-sm">
        <div className="flex items-center gap-0 px-4 md:px-6">
          <div className="tabs tabs-border flex-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`panel-${t.id}`}
                  onClick={() => { setTab(t.id); setError(""); }}
                  className={`tab ${active ? "tab-active" : ""}`}
                >
                  <Icon size={16} />
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-end">
            <Link
              href="/nahkoda"
              className="hidden items-center gap-1.5 btn btn-ghost btn-xs rounded-full md:inline-flex"
            >
              Dashboard Nahkoda →
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div role="tabpanel" id={`panel-${tab}`}>
          {tab === "users" && <StatsOverview />}
          <ErrorNote message={error} />
          {tab === "users" && <UsersTab setError={setError} />}
          {tab === "tambangan" && <TambanganTab setError={setError} />}
          {tab === "kapal" && <KapalTab setError={setError} />}
        </div>
      </main>
    </div>
  );
}
