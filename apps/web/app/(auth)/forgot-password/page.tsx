import { AuthFormShell } from "@modules/auth/components/auth-form-shell";
import { ForgotPasswordForm } from "@modules/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthFormShell title="Reset password" subtitle="Enter your email or username and follow the reset flow.">
      <ForgotPasswordForm />
    </AuthFormShell>
  );
}
