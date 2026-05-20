import { redirect } from "next/navigation";
import { AuthFormShell } from "@modules/auth/components/auth-form-shell";
import { LoginForm } from "@modules/auth/components/login-form";
import { getSession } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  const params = searchParams ? await searchParams : {};
  const redirectTo = process.env.NEXT_PUBLIC_APP_URL;
  return (
    <AuthFormShell title="Sign in" subtitle="Sign in to your clinic workspace">
      <LoginForm redirectTo={redirectTo} />
    </AuthFormShell>
  );
}

function safeRedirectPath(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  if (path.startsWith("/login")) return "/";
  return path;
}
