import { AuthFormShell } from "@modules/auth/components/auth-form-shell";
import { LoginForm } from "@modules/auth/components/login-form";

export default async function LoginPage() {
  const redirectTo = process.env.NEXT_PUBLIC_APP_URL;
  return (
    <AuthFormShell title="Sign in" subtitle="Sign in to your clinic workspace">
      <LoginForm redirectTo={redirectTo} />
    </AuthFormShell>
  );
}
