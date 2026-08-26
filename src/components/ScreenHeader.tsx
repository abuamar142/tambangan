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
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-teal-100 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
      {backHref && (
        <Link
          href={backHref}
          aria-label="Kembali"
          className="rounded-full p-1.5 text-teal-700 hover:bg-teal-50 active:bg-teal-100 dark:text-teal-400 dark:hover:bg-slate-700 dark:active:bg-slate-600"
        >
          <ArrowLeft size={20} />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        {subtitle && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      <ThemeToggle />
    </div>
  );
}
