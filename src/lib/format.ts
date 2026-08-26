import type { KapalLiveDto } from "./types";

export function timeAgo(ts: string | Date): string {
  const time = typeof ts === "string" ? new Date(ts).getTime() : ts.getTime();
  const diff = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export function minutesLeft(timerEndAt: string | null): number | null {
  if (!timerEndAt) return null;
  const diff = Math.ceil((new Date(timerEndAt).getTime() - Date.now()) / 60000);
  return diff > 0 ? diff : null;
}

export function sortByTimer(a: KapalLiveDto, b: KapalLiveDto): number {
  if (a.timerEndAt && b.timerEndAt) {
    return new Date(a.timerEndAt).getTime() - new Date(b.timerEndAt).getTime();
  }
  if (a.timerEndAt) return -1;
  if (b.timerEndAt) return 1;
  return 0;
}
