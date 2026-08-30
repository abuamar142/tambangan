import type { ReactNode } from "react";

export function Screen({
  children,
  size = "default",
  className = "",
}: {
  children: ReactNode;
  size?: "default" | "wide";
  className?: string;
}) {
  const maxW = size === "wide" ? "max-w-6xl" : "max-w-md md:max-w-3xl";
  return (
    <div className={`relative min-h-screen bg-[var(--color-bg)] ${className}`}>
      {/* Subtle brand glow at the top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(13,148,136,0.12),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(13,148,136,0.18),transparent)]" />
      <div className={`relative mx-auto flex min-h-screen w-full ${maxW} flex-col`}>{children}</div>
    </div>
  );
}

export function ScreenContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex-1 space-y-4 p-4 md:p-6 ${className}`}>{children}</div>;
}
