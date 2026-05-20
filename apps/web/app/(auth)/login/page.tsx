import { AuthFormShell } from "@modules/auth/components/auth-form-shell";
import { LoginForm } from "@modules/auth/components/login-form";

export default function LoginPage() {
  return (
    <AuthFormShell title="Sign in" subtitle="Use your clinic email or username to access your workspace.">
      <LoginForm />
    </AuthFormShell>
  );
}
