"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

export function ShareButton({
  title,
  text,
  url,
  compact = false,
}: {
  title: string;
  text: string;
  url?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = url ?? window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleShare}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-secondary)]"
        aria-label="Bagikan status"
        title={copied ? "Disalin!" : "Bagikan"}
      >
        <Share2 size={13} />
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-alt)]"
      aria-label="Bagikan status"
    >
      <Share2 size={13} />
      {copied ? "Disalin!" : "Bagikan"}
    </button>
  );
}
