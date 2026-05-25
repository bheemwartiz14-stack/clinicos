"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form-controls";
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
        <FormField
          label="Email or username"
          id="identifier"
          type="text"
          autoComplete="username"
          placeholder="admin@example.com"
          error={errors.identifier?.message as string | undefined}
          className="h-10 rounded-md border-slate-200 bg-white text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:ring-sky-200"
          {...register("identifier")}
        />
      </div>

      <div className="space-y-2">
        <span className="relative mt-2 block">
          <FormField
            label="Password"
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message as string | undefined}
            className="h-10 rounded-md border-slate-200 bg-white pr-11 text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:ring-sky-200"
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-2 top-8 grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </span>
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
