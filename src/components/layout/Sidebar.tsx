"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Anchor, Shield, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { api } from "@/lib/client/api";
import { useEffect, useState } from "react";
import type { UserInfo } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/",          label: "Beranda",   icon: Home },
  { href: "/tambangan", label: "Tambangan", icon: MapPin },
  { href: "/nahkoda",   label: "Nahkoda",   icon: Anchor, auth: true },
  { href: "/admin",     label: "Admin",     icon: Shield, admin: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle, mounted } = useTheme();
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
    <aside className="hidden md:flex md:w-[280px] md:flex-col md:border-r md:border-base-300 md:bg-base-100">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-base-300">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content">
          <Anchor size={16} />
        </div>
        <span className="text-sm font-bold tracking-tight text-base-content">
          TambanganTrack
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-3 py-4" role="navigation" aria-label="Main navigation">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href
            || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer utilities */}
      <div className="border-t border-base-300 px-3 py-3 space-y-1">
        {me && (
          <div className="px-3 py-1.5 text-xs font-medium text-base-content/50">
            {me.username}
          </div>
        )}
        {mounted && (
          <button
            onClick={toggle}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-base-content/70 transition-all hover:bg-base-200"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          </button>
        )}
      </div>
    </aside>
  );
}
