export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-teal-50 px-4 dark:bg-slate-900">
      <div className="flex w-full max-w-md flex-col gap-4">
        {/* Header skeleton */}
        <div className="h-12 animate-pulse rounded-2xl bg-white dark:bg-slate-800" />

        {/* 3 card skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl bg-white dark:bg-slate-800"
          />
        ))}

        {/* Small text skeleton */}
        <div className="mx-auto h-4 w-32 animate-pulse rounded bg-white dark:bg-slate-800" />
      </div>
    </div>
  );
}
