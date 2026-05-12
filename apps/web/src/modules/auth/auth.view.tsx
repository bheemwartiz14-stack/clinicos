"use client";

import { Button } from "@mediclinicpro/ui/components/button";
import { Input } from "@mediclinicpro/ui/components/input";
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";

import { type LoginActionState, loginAction } from "./auth.actions";

const initialLoginState: LoginActionState = {};

export function LoginView() {
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(loginAction, initialLoginState);
  const [showPassword, setShowPassword] = useState(false);
  const nextPath = searchParams.get("next") ?? "/dashboard";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 text-slate-950 dark:bg-[#020617] dark:text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/20" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-500/20" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b22_1px,transparent_1px),linear-gradient(to_bottom,#64748b22_1px,transparent_1px)] bg-[size:44px_44px] opacity-30 dark:opacity-20" />
      </div>

      <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        <section className="hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
            <Sparkles className="h-4 w-4 text-cyan-500" />
            Smart clinic management workspace
          </div>

          <h1 className="max-w-xl text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
            Manage your clinic with a modern dashboard.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
            Secure login for doctors, admins, receptionists, billing teams and clinic staff.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {["Patients", "Appointments", "Billing"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm font-medium text-slate-800 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-white"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <form
          action={formAction}
          className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 dark:shadow-black/40 sm:p-8"
        >
          <input type="hidden" name="next" value={nextPath} />

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950">
              <Sparkles className="h-6 w-6" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              MediClinic Pro
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to your clinic workspace
            </p>
          </div>

          <div className="space-y-5">
            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              htmlFor="email"
            >
              Email address
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="h-12 rounded-2xl border-slate-200 bg-white pl-10 text-slate-950 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-white"
                  required
                />
              </div>
            </label>

            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              htmlFor="password"
            >
              Password
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="h-12 rounded-2xl border-slate-200 bg-white pl-10 pr-10 text-slate-950 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-white"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
          </div>

          {state.message ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {state.message}
            </div>
          ) : null}

          <Button
            className="mt-6 h-12 w-full rounded-2xl bg-slate-950 text-white shadow-lg transition hover:scale-[1.01] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            disabled={isPending}
            type="submit"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Continue"
            )}
          </Button>

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Protected access for clinic team members only.
          </p>
        </form>
      </div>
    </main>
  );
}
