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
      <CardContent className="relative flex flex-col gap-1.5 px-2.5 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-6 sm:py-5">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(127,86,53,0.35),transparent)]" />
        <div className="min-w-0 text-center sm:text-left">
          <p className="text-[0.54rem] leading-tight uppercase tracking-[0.08em] text-[color:oklch(0.52_0.022_39)] sm:text-xs sm:tracking-[0.24em]">
            {label}
          </p>
          <p className="mt-1 text-lg leading-none text-[color:oklch(0.245_0.026_41)] sm:mt-4 sm:text-4xl">
            {value}
          </p>
        </div>
        <div className="flex size-7 shrink-0 items-center justify-center self-center rounded-lg border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,231,218,0.8))] text-[color:oklch(0.4_0.045_35)] shadow-[0_10px_18px_-18px_rgba(98,67,40,0.75)] sm:size-11 sm:self-auto sm:rounded-2xl sm:shadow-[0_14px_32px_-22px_rgba(98,67,40,0.75)]">
          <Icon size={12} strokeWidth={2} className="sm:hidden" />
          <Icon size={18} strokeWidth={1.8} className="hidden sm:block " />
        </div>
      </CardContent>
    </Card>
  );
}
