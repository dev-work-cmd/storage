// Owns the dashboard overview route.
// Reads owner-scoped document metrics and recent records for the shell homepage.
// Must not implement upload behavior before Stage 06.
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  Files,
  TriangleAlert,
  Upload,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PasskeySettings } from "@/features/auth/components/passkey-settings";
import { MetricCard } from "@/features/dashboard/components/metric-card";
import { RecentDocuments } from "@/features/dashboard/components/recent-documents";
import { getDashboardOverview } from "@/features/dashboard/server/get-dashboard-overview";

export default async function DashboardPage() {
  const overview = await getDashboardOverview();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
              Intake
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
              Document workspace
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Upload and QR replacement workflows will start here. The current
              dashboard reads live document records when they exist.
            </p>
          </div>
          <Link
            className={buttonVariants({
              variant: "primary",
              className: "w-full sm:w-auto",
            })}
            href="/dashboard/documents/new"
          >
            <Upload size={18} strokeWidth={1.8} />
            Upload new document
          </Link>
        </CardContent>
      </Card>

      <section
        aria-label="Document summary"
        className="grid gap-2 sm:gap-4 grid-cols-4"
      >
        <MetricCard
          icon={Files}
          label="Total documents"
          value={overview.metrics.totalDocuments}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Processed"
          value={overview.metrics.processedDocuments}
        />
        <MetricCard
          icon={TriangleAlert}
          label="Failed"
          value={overview.metrics.failedDocuments}
        />
        <MetricCard
          icon={BarChart3}
          label="Scans"
          value={overview.metrics.scanCount}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <RecentDocuments documents={overview.recentDocuments} />
        <PasskeySettings />
      </div>
    </div>
  );
}
