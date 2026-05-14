// Owns the protected dashboard layout for all dashboard routes.
// Keeps the shared shell in one place so later nested routes inherit navigation.
// Must remain dynamic because it validates the request session.
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
