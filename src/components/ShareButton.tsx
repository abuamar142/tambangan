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
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
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
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
      aria-label="Bagikan status"
    >
      <Share2 size={13} />
      {copied ? "Disalin!" : "Bagikan"}
    </button>
  );
}
