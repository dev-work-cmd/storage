// Owns the authenticated dashboard frame shared by dashboard routes.
// Keeps navigation, topbar, and page chrome consistent for later document workflows.
// Must protect its children with a server-validated session.
import type { ReactNode } from "react";

import {
  DashboardMobileBottomNav,
  DashboardSidebar,
} from "@/components/layout/dashboard-navigation";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { requireCurrentSession } from "@/server/auth/session";

export async function DashboardShell({ children }: { children: ReactNode }) {
  const session = await requireCurrentSession();

  return (
    <div className="h-screen overflow-hidden bg-[#fbfaf8] text-zinc-950">
      <div className="mx-auto flex h-full w-full max-w-[98rem] gap-4 px-3 py-3 lg:px-5 lg:py-5">
        <DashboardSidebar userName={session.user.name} />
        <div className="min-h-0 min-w-0 flex-1 pb-24 lg:pb-0">
          <div className="flex h-full min-h-0 flex-col overflow-visible rounded-[2rem] border border-[color:oklch(0.92_0.012_74)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(251,248,244,0.92))] shadow-[0_28px_80px_-48px_rgba(84,53,28,0.25)]">
            <DashboardTopbar userName={session.user.name} />
            <main className="relative z-0 min-h-0 flex-1 overflow-y-auto px-4 py-5 lg:px-7 lg:py-7">
              {children}
            </main>
          </div>
        </div>
      </div>
      <DashboardMobileBottomNav />
    </div>
  );
}
