"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { BottomNav } from "./BottomNav";

const STANDALONE_PATHS = ["/", "/login", "/register"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_PATHS.some(
    (p) => pathname === p || pathname === p + "/"
  );

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-base-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl p-4 md:p-6 animate-page-in">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
