import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { LoginView } from "@/modules/auth/auth.view";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 text-slate-950 dark:bg-[#020617] dark:text-white">
      <LoginView />
    </main>
  );
}
