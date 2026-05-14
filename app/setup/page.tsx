// Owns the first-owner bootstrap route.
// Blocks once an owner exists so public registration never remains available.
// Must stay thin and delegate mutation to auth feature actions.
import { redirect } from "next/navigation";

import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { SetupOwnerForm } from "@/features/auth/components/setup-owner-form";
import { isSetupAllowed } from "@/server/auth/owner-setup";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (!(await isSetupAllowed())) {
    redirect("/login");
  }

  return (
    <AuthFormShell
      title="Create owner account"
      description="Bootstrap the only public setup path. This route closes after the first owner exists."
    >
      <SetupOwnerForm />
    </AuthFormShell>
  );
}
