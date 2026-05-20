"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type AuthActionState } from "../actions/auth.actions";
import { loginSchema, type LoginInput } from "@mediclinic/auth";

const initialState: AuthActionState = { ok: false };

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo = "/" }: LoginFormProps) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(loginAction, initialState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema) as any,
    mode: "onBlur",
    defaultValues: {
      identifier: "",
      password: ""
    }
  });

  useEffect(() => {
    if (state.ok) {
      router.replace(redirectTo as Route);
      router.refresh();
    } else if (state.message) {
      setErrorMessage(state.message);
      if (state.fieldErrors?.identifier) setError("identifier", { message: state.fieldErrors.identifier });
      if (state.fieldErrors?.password) setError("password", { message: state.fieldErrors.password });
    }
  }, [state, router, setError, redirectTo]);

  const onSubmit = (data: LoginInput) => {
    setErrorMessage(null);
    clearErrors();
    const formData = new FormData();
    formData.append("identifier", data.identifier.trim());
    formData.append("password", data.password);
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="identifier" className="text-xs text-slate-700">
          Email or username
        </Label>
        <span className="relative mt-2 block">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input
            id="identifier"
            type="text"
            autoComplete="username"
            placeholder="admin@example.com"
            aria-invalid={Boolean(errors.identifier)}
            className="h-10 rounded-md border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:ring-sky-200"
            {...register("identifier")}
          />
        </span>
        {errors.identifier?.message ? <p className="text-xs font-medium text-destructive">{errors.identifier.message as any}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs text-slate-700">
          Password
        </Label>
        <span className="relative mt-2 block">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={Boolean(errors.password)}
            className="h-10 rounded-md border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:ring-sky-200"
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </span>
        {errors.password?.message ? <p className="text-xs font-medium text-destructive">{errors.password.message as any}</p> : null}
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription className="text-xs font-medium">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="mt-2 h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
      >
        {isPending ? "Signing in..." : "Continue"}
      </Button>
    </form>
  );
}
