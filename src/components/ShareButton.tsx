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
        className="btn btn-ghost btn-xs btn-square rounded-full"
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
      className="btn btn-outline btn-sm gap-1.5 rounded-full text-xs"
      aria-label="Bagikan status"
    >
      <Share2 size={13} />
      {copied ? "Disalin!" : "Bagikan"}
    </button>
  );
}
