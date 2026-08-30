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
    <div className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Kembali"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-brand)] shadow-sm transition hover:bg-[var(--color-brand)]/10 active:bg-[var(--color-brand)]/15"
          >
            <ArrowLeft size={18} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold tracking-tight text-[var(--color-text)]">{title}</h1>
          {subtitle && <p className="truncate text-xs text-[var(--color-text-secondary)]">{subtitle}</p>}
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
