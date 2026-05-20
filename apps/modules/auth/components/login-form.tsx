"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/form-controls";
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
      <FormField
        label="Email or username"
        type="text"
        autoComplete="username"
        error={errors.identifier?.message as any}
        placeholder="Enter your email or username"
        {...register("identifier")}
      />
      <FormField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message as any}
        placeholder="Enter your password"
        {...register("password")}
      />
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
      <a href="/forgot-password" className="block text-center text-sm font-medium text-primary hover:underline">
        Reset password
      </a>
    </form>
  );
}