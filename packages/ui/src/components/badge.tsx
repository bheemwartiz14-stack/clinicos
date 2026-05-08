import { cn } from "@mediclinicpro/utils";
import type * as React from "react";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800 dark:bg-teal-950 dark:text-teal-200",
        className,
      )}
      {...props}
    />
  );
}
