import { AuthFormShell } from "@modules/auth/components/auth-form-shell";
import { ResetPasswordForm } from "@modules/auth/components/reset-password-form";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;

  return (
    <AuthFormShell title="Choose a new password" subtitle="Create a secure password for your MediClinic account.">
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">This reset link is missing a token.</p>
      )}
    </AuthFormShell>
  );
}
