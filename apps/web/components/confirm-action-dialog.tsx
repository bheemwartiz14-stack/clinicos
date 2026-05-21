"use client";

import type { ComponentType } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type ConfirmActionDialogProps = {
  action: (formData: FormData) => unknown | Promise<unknown>;
  title: string;
  description: string;
  triggerLabel: string;
  confirmLabel: string;
  fields?: Record<string, string>;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  triggerClassName?: string;
  destructive?: boolean;
};

export function ConfirmActionDialog({
  action,
  title,
  description,
  triggerLabel,
  confirmLabel,
  fields,
  icon: Icon = AlertTriangle,
  triggerClassName,
  destructive = true
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-destructive/50 hover:text-destructive",
            triggerClassName
          )}
        >
          {triggerLabel}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border border-border bg-card/95 shadow-2xl shadow-foreground/10 backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogMedia className={destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}>
            <Icon className="h-5 w-5" aria-hidden />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form
            action={async (formData) => {
              await action(formData);
            }}
          >
            {fields
              ? Object.entries(fields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)
              : null}
            <Button type="submit" variant={destructive ? "destructive" : "default"} className="w-full sm:w-auto">
              {confirmLabel}
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
