"use client";

import { Button } from "@mediclinicpro/ui/components/button";
import { Input } from "@mediclinicpro/ui/components/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    setLoading(false);

    if (!response.ok) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={onSubmit}
    >
      <div className="mb-6">
        <h1 className="font-semibold">MediClinic Pro</h1>
        <p className="text-sm text-slate-500">Sign in to your clinic workspace</p>
      </div>
      <label className="mb-3 block text-sm font-medium" htmlFor="email">
        Email
        <Input
          className="mt-1"
          defaultValue="admin@clinic.local"
          id="email"
          name="email"
          type="email"
        />
      </label>
      <label className="mb-5 block text-sm font-medium" htmlFor="password">
        Password
        <Input
          className="mt-1"
          defaultValue="admin12345"
          id="password"
          name="password"
          type="password"
        />
      </label>
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <Button className="w-full" disabled={loading} type="submit">
        {loading ? "Signing in..." : "Continue"}
      </Button>
    </form>
  );
}
