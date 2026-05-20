"use client";

import { cn } from "@mediclinic/ui";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FieldProps = {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
};

export function FormField({ label, error, hint, required, className, ...props }: FieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2 text-sm">
      {label ? (
        <span className="font-medium text-foreground">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </span>
      ) : null}
      <Input
        {...props}
        className={cn(
          "h-11",
          error && "border-rose-400 focus-visible:ring-rose-500/25",
          className
        )}
      />
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  );
}

export function TextareaField(props: { label?: string; error?: string; hint?: string; required?: boolean; className?: string; rows?: number; placeholder?: string } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "label" | "error" | "hint" | "required" | "className" | "rows" | "placeholder">) {
  const { label, error, hint, required, className, rows, placeholder, ...rest } = props;
  return (
    <label className="grid gap-2 text-sm">
      {label ? (
        <span className="font-medium text-foreground">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </span>
      ) : null}
      <Textarea
        {...rest}
        rows={rows}
        placeholder={placeholder}
        className={cn(
          error && "border-rose-400 focus-visible:ring-rose-500/25",
          className
        )}
      />
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  );
}

export function CheckboxField(props: { label: string; error?: string; required?: boolean; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "label" | "className">) {
  const { label, error, required, className, ...rest } = props;
  return (
    <label className="flex items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        {...rest}
        className={cn(
          "h-4 w-4 rounded border-border text-primary accent-primary focus:ring-2 focus:ring-primary/20",
          error && "border-rose-400",
          className
        )}
      />
      <span className={cn("font-medium text-foreground", required && "after:ml-0.5 after:text-red-500 after:content-['*']")}>{label}</span>
      {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  );
}

export function RadioField(props: { label: string; error?: string; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "label" | "className">) {
  const { label, error, className, ...rest } = props;
  return (
    <label className="flex items-center gap-2.5 text-sm">
      <input
        type="radio"
        {...rest}
        className={cn(
          "h-4 w-4 border-border text-primary accent-primary focus:ring-2 focus:ring-primary/20",
          error && "border-rose-400",
          className
        )}
      />
      <span className="font-medium text-foreground">{label}</span>
      {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  );
}

export function DatePickerField(props: { label?: string; error?: string; hint?: string; required?: boolean; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof { label?: string; error?: string; hint?: string; required?: boolean; className?: string }>) {
  return <FormField type="date" {...props} />;
}

export function SelectField(props: { label?: string; error?: string; hint?: string; required?: boolean; className?: string; children?: React.ReactNode; options?: Array<{ value: string; label: string }> } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "label" | "error" | "hint" | "required" | "className" | "children" | "options">) {
  const { options, children, ...rest } = props;
  return (
    <Select2Field {...rest}>
      {options ? options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>) : children}
    </Select2Field>
  );
}

export function Select2Field(props: { label?: string; error?: string; hint?: string; required?: boolean; className?: string; children?: React.ReactNode } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "label" | "error" | "hint" | "required" | "className" | "children">) {
  const { label, error, hint, required, className, children, ...rest } = props;
  return (
    <label className="grid gap-2 text-sm">
      {label ? (
        <span className="font-medium text-foreground">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </span>
      ) : null}
      <select
        {...rest}
        className={cn(
          "h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-rose-400 focus-visible:ring-rose-500/25",
          className
        )}
      >
        {children}
      </select>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  );
}

export type FormActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
