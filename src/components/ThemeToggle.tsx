"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle, mounted } = useTheme();

  if (!mounted) {
    return (
      <span
        aria-hidden
        className={`inline-block h-9 w-9 skeleton rounded-xl ${className}`}
      />
    );
  }

  return (
    <button
      onClick={toggle}
      className={`btn btn-ghost btn-sm rounded-xl ${className}`}
      aria-label={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
