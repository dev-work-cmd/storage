// Owns the compact dashboard metric presentation.
// Keeps summary cards visually consistent and scan-friendly on mobile.
// Must stay presentation-only so the page controls data loading.
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

export function MetricCard({ label, value, icon }: MetricCardProps) {
  const Icon = icon;

  return (
    <Card className="overflow-hidden">
      <CardContent className="relative flex items-start justify-between gap-4">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(127,86,53,0.35),transparent)]" />
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[color:oklch(0.52_0.022_39)]">
            {label}
          </p>
          <p className="mt-4 font-heading text-4xl text-[color:oklch(0.245_0.026_41)]">
            {value}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,231,218,0.8))] text-[color:oklch(0.4_0.045_35)] shadow-[0_14px_32px_-22px_rgba(98,67,40,0.75)]">
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </CardContent>
    </Card>
  );
}
