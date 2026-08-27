export function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      ))}
    </div>
  );
}

export function SkeletonText({ width = "w-32" }: { width?: string }) {
  return <div className={`h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800 ${width}`} />;
}
