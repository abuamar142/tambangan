"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    return typeof window !== "undefined" && sessionStorage.getItem("pwa-dismissed") === "1";
  });
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    const prompt = deferredRef.current;
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      deferredRef.current = null;
      setDeferred(null);
      setDismissed(true);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    sessionStorage.setItem("pwa-dismissed", "1");
  }, []);

  if (!deferred || dismissed) return null;

  return (
    <div className="alert fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md border-base-300 bg-base-200 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Download size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-base-content">Install Tambangan</p>
          <p className="mt-0.5 text-xs text-base-content/60">
            Tambahkan ke home screen untuk akses cepat
          </p>
        </div>
        <button onClick={handleDismiss} aria-label="Tutup" className="btn btn-ghost btn-sm shrink-0 p-1">
          <X size={16} />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleInstall}
          className="btn btn-primary flex-1"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="btn btn-ghost btn-sm"
        >
          Nanti
        </button>
      </div>
    </div>
  );
}
