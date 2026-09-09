import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ScreenHeader({
  title,
  subtitle,
  backHref,
  actions,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-10 border-b border-base-300 bg-base-100/80 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Kembali"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-primary shadow-sm transition hover:bg-primary/10 active:bg-primary/15"
          >
            <ArrowLeft size={18} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold tracking-tight text-base-content">{title}</h1>
          {subtitle && <p className="truncate text-xs text-base-content/70">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}
