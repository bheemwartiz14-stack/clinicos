import { AuthFormShell } from "@modules/auth/components/auth-form-shell";
import { LoginForm } from "@modules/auth/components/login-form";

export default async function LoginPage() {
  return (
    <AuthFormShell title="Sign in" subtitle="Sign in to your clinic workspace">
      <LoginForm redirectTo="/" />
    </AuthFormShell>
  );
}
