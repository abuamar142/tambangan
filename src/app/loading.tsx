export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="flex w-full max-w-md flex-col gap-4">
        {/* Header skeleton */}
        <div className="h-12 animate-pulse rounded-2xl bg-[var(--color-surface)]" />

        {/* 3 card skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl bg-[var(--color-surface)]"
          />
        ))}

        {/* Small text skeleton */}
        <div className="mx-auto h-4 w-32 animate-pulse rounded bg-[var(--color-surface)]" />
      </div>
    </div>
  );
}
