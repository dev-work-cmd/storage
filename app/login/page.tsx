// Owns the username/password and passkey login route.
// Redirects authenticated users away from the public auth surface.
// Must not expose whether a submitted username exists.
import { redirect } from "next/navigation";

import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthFormShell
      title="Sign in"
      description="Use your owner username, password, or a registered passkey."
    >
      <LoginForm />
    </AuthFormShell>
  );
}
