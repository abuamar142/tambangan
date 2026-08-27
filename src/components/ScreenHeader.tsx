import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function ScreenHeader({
  title,
  subtitle,
  backHref,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/85 px-4 py-3 backdrop-blur-md dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]/80">
      {backHref && (
        <Link
          href={backHref}
          aria-label="Kembali"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-teal-700 transition hover:bg-teal-50 active:bg-teal-100 dark:text-teal-400 dark:hover:bg-slate-700 dark:active:bg-slate-600"
        >
          <ArrowLeft size={18} />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold tracking-tight text-[var(--color-text)] dark:text-slate-100">{title}</h1>
        {subtitle && <p className="truncate text-xs text-[var(--color-text-secondary)] dark:text-slate-400">{subtitle}</p>}
      </div>
      <ThemeToggle />
    </div>
  );
}
