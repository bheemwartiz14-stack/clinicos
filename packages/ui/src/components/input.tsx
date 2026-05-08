import { cn } from "@mediclinicpro/utils";
import type * as React from "react";

export function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-slate-500 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950",
        className,
      )}
      {...props}
    />
  );
}
