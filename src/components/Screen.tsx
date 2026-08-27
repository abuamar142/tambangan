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
    <div className={`min-h-screen bg-[var(--color-bg)] dark:bg-[var(--color-bg)] ${className}`}>
      <div className={`mx-auto flex min-h-screen w-full ${maxW} flex-col`}>{children}</div>
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
