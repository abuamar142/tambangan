export function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-28 skeleton rounded-2xl" />
      ))}
    </div>
  );
}

export function SkeletonText({ width = "w-32" }: { width?: string }) {
  return <div className={`h-4 skeleton rounded ${width}`} />;
}
