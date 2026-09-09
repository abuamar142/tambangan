"use client";

import { Anchor } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function MobileHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-base-300 bg-base-100/80 px-4 backdrop-blur-md md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-content">
          <Anchor size={14} />
        </div>
        <span className="text-sm font-bold tracking-tight text-base-content">
          TambanganTrack
        </span>
      </div>
      <ThemeToggle />
    </header>
  );
}
