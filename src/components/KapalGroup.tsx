import { Anchor } from "lucide-react";
import { minutesLeft, timeAgo } from "@/lib/format";
import type { KapalLiveDto } from "@/lib/types";
import { ChannelBar } from "./ChannelBar";

export function KapalGroup({ label, items }: { label: string; items: KapalLiveDto[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
        {label} · {items.length}
      </p>
      <div className="space-y-2">
        {items.map((k) => {
          const mins = minutesLeft(k.timerEndAt);
          return (
            <div key={k.slug} className="rounded-xl border border-teal-100 bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-slate-900">
                  <Anchor size={15} className="text-teal-600" />
                  {k.nama}
                </span>
                <span className="font-mono text-xs text-slate-400">{timeAgo(k.lastUpdated)}</span>
              </div>
              <div className="mt-2.5">
                <ChannelBar status={k.status} compact />
              </div>
              {mins !== null && (
                <p className="mt-2 font-mono text-xs font-semibold text-amber-700">
                  ~{mins} menit lagi berangkat
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
