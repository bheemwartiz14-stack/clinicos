"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction, type AuthActionState } from "../actions/auth.actions";
import { loginSchema } from "@mediclinic/auth";

const initialState: AuthActionState = { ok: false };

export function LoginForm() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(loginAction, initialState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    resolver: zodResolver(loginSchema) as any,
    mode: "onBlur"
  });

  useEffect(() => {
    if (state.ok) {
      router.push("/");
    } else if (state.message) {
      setErrorMessage(state.message);
      if (state.message.toLowerCase().includes("email") || state.message.toLowerCase().includes("identifier")) {
        setError("identifier", { message: state.message });
      } else if (state.message.toLowerCase().includes("password")) {
        setError("password", { message: state.message });
      }
    }
  }, [state, router, setError]);

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append("identifier", data.identifier);
    formData.append("password", data.password);
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      <label className="block text-xs font-medium text-[#1d2c43]">
        Enter User name
        <span className="relative mt-2 block">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9db0c8]" aria-hidden="true" />
          <Input
            type="text"
            autoComplete="username"
            aria-invalid={Boolean(errors.identifier)}
            className="h-9 rounded-2xl border-[#d8e2ee] bg-white px-10 text-sm text-[#17243a] shadow-none placeholder:text-[#9db0c8] focus-visible:border-[#b9c8dc] focus-visible:ring-2 focus-visible:ring-[#dce8f5]"
            {...register("identifier")}
          />
        </span>
        {errors.identifier?.message ? <span className="mt-1.5 block text-xs font-medium text-rose-500">{errors.identifier.message as any}</span> : null}
      </label>

      <label className="block text-xs font-medium text-[#1d2c43]">
        Password
        <span className="relative mt-2 block">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9db0c8]" aria-hidden="true" />
          <Input
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            className="h-9 rounded-2xl border-[#d8e2ee] bg-white px-10 pr-11 text-sm text-[#17243a] shadow-none placeholder:text-[#9db0c8] focus-visible:border-[#b9c8dc] focus-visible:ring-2 focus-visible:ring-[#dce8f5]"
            {...register("password")}
          />
          <Eye className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9db0c8]" aria-hidden="true" />
        </span>
        {errors.password?.message ? <span className="mt-1.5 block text-xs font-medium text-rose-500">{errors.password.message as any}</span> : null}
      </label>

      {errorMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="mt-2 h-9 w-full rounded-2xl bg-[#02091a] text-xs font-semibold text-white shadow-[0_8px_16px_rgba(2,9,26,0.2)] hover:bg-[#111a2d]"
      >
        {isPending ? "Signing in..." : "Continue"}
      </Button>
    </form>
  );
}
