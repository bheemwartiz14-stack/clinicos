"use client";

import { cn } from "@mediclinic/ui";
import { DatePickerField, Select2Field } from "@/components/form-controls";

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  placeholder,
  required
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  error?: string;
  placeholder?: string;
  required?: boolean;
}) {
  if (type === "date" || type === "time") {
    return <DatePickerField label={label} name={name} type={type} defaultValue={defaultValue ?? ""} error={error} required={required} />;
  }

  return (
    <label className="grid gap-2 text-sm">
      <span className="font-semibold text-slate-800">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={cn(
          "h-11 rounded-lg border border-slate-200 bg-white/90 px-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
          error && "border-rose-300 focus:border-rose-400 focus:ring-rose-400/20"
        )}
        required={required}
      />
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  error,
  placeholder
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  error?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-semibold text-slate-800">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        rows={4}
        className={cn(
          "rounded-lg border border-slate-200 bg-white/90 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
          error && "border-rose-300 focus:border-rose-400 focus:ring-rose-400/20"
        )}
      />
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  error,
  children,
  required
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return <Select2Field label={label} name={name} defaultValue={defaultValue ?? ""} error={error} required={required}>{children}</Select2Field>;
}

export function Toggle({ label, description, name, defaultChecked }: { label: string; description: string; name: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white/80 p-4">
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="mt-1 block text-xs text-slate-500">{description}</span>
      </span>
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="h-5 w-5 accent-teal-600" />
    </label>
  );
}
