// Owns the compact dashboard metric presentation.
// Keeps summary cards visually consistent and scan-friendly on mobile.
// Must stay presentation-only so the page controls data loading.
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";

import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string | number;
  icon: IconSvgElement;
};

export function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            {value}
          </p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700">
          <HugeiconsIcon icon={icon} size={18} strokeWidth={1.8} />
        </div>
      </CardContent>
    </Card>
  );
}
