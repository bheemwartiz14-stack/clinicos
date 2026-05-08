import { cn } from "@mediclinicpro/utils";
import type * as React from "react";

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full caption-bottom text-sm", className)} {...props} />;
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("h-10 px-3 text-left align-middle font-medium text-slate-500", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("p-3 align-middle", className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("border-b border-slate-100 dark:border-slate-800", className)} {...props} />
  );
}
