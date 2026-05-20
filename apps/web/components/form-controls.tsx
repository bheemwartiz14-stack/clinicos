"use client";

import { cn } from "@mediclinic/ui";

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
      <input
        {...props}
        className={cn(
          "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20",
          error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
          className
        )}
      />
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  );
}

export function SelectField(props: { label?: string; error?: string; hint?: string; required?: boolean; className?: string; options: Array<{ value: string; label: string }> } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "label" | "options" | "className">) {
  const { label, error, hint, required, options, className, ...rest } = props;
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
          "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20",
          error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
          className
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  );
}

export function Select2Field(props: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> & { label?: string; error?: string; hint?: string; className?: string; children?: React.ReactNode }) {
  const { className, children, ...rest } = props;
  return (
    <label className="grid gap-2 text-sm">
      {props.label ? (
        <span className="font-medium text-foreground">
          {props.label}
          {props.required ? <span className="ml-1 text-red-500">*</span> : null}
        </span>
      ) : null}
      <select
        {...rest}
        className={cn(
          "h-11 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-10 text-sm text-foreground shadow-sm outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20",
          props.error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
          className
        )}
      >
        {children}
      </select>
      {props.hint ? <span className="text-xs text-muted-foreground">{props.hint}</span> : null}
      {props.error ? <span className="text-xs font-medium text-rose-500">{props.error}</span> : null}
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
      <textarea
        {...rest}
        rows={rows}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20",
          error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
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

export type FormActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};