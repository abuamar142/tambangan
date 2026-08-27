"use client";

import { useEffect, useState } from "react";

export function useCountdown(timerEndAt: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!timerEndAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timerEndAt]);

  if (!timerEndAt) return null;

  const end = new Date(timerEndAt).getTime();
  const diff = end - now;
  if (diff <= 0) return { minutes: 0, seconds: 0, expired: true, display: "0:00" };

  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    minutes,
    seconds,
    expired: false,
    display: `${minutes}:${String(seconds).padStart(2, "0")}`,
  };
}
