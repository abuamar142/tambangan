"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Anchor, Shield } from "lucide-react";
import { api } from "@/lib/client/api";
import { useEffect, useState } from "react";
import type { UserInfo } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/",          label: "Beranda",   icon: Home },
  { href: "/tambangan", label: "Tambangan", icon: MapPin },
  { href: "/nahkoda",   label: "Nahkoda",   icon: Anchor, auth: true },
  { href: "/admin",     label: "Admin",     icon: Shield, admin: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const [me, setMe] = useState<UserInfo | null>(null);

  useEffect(() => {
    api<{ user: UserInfo | null }>("/api/auth/me")
      .then((r) => setMe(r.user))
      .catch(() => {});
  }, []);

  const filteredNav = NAV_ITEMS.filter((item) => {
    if (item.admin) return me?.role === "admin";
    if (item.auth) return !!me;
    return true;
  });

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 border-t border-base-300 bg-base-100/95 backdrop-blur-md md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-16 items-center justify-around">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href
            || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors duration-150 ${
                active
                  ? "text-primary"
                  : "text-base-content/50 active:text-base-content/70"
              }`}
            >
              <div className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 ${
                active ? "bg-primary/10" : ""
              }`}>
                <Icon size={20} />
                {active && (
                  <div className="absolute -bottom-0.5 h-0.5 w-4 rounded-full bg-primary" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
