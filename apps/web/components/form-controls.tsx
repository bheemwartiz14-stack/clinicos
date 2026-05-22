"use client";

import * as React from "react";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@mediclinic/ui";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const { label, error, hint, required, className, type = "date", name, defaultValue, value, disabled, min, max, id, ...rest } = props;

  if (type !== "date") {
    return <FormField label={label} error={error} hint={hint} required={required} className={className} type={type} name={name} defaultValue={defaultValue} value={value} disabled={disabled} min={min} max={max} id={id} {...rest} />;
  }

  const initialValue = stringifyFieldValue(value ?? defaultValue);
  const [selectedValue, setSelectedValue] = React.useState(initialValue);
  const selectedDate = parseDateValue(selectedValue);
  const minDate = parseDateValue(stringifyFieldValue(min));
  const maxDate = parseDateValue(stringifyFieldValue(max));

  React.useEffect(() => {
    if (value !== undefined) setSelectedValue(stringifyFieldValue(value));
  }, [value]);

  return (
    <label className="grid gap-2 text-sm">
      {label ? (
        <span className="font-medium text-foreground">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </span>
      ) : null}
      <input type="hidden" name={name} value={selectedValue} disabled={disabled} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={cn(
              "h-11 w-full justify-start rounded-md border-input bg-background px-3 text-left text-sm font-normal",
              !selectedValue && "text-muted-foreground",
              error && "border-rose-400 ring-2 ring-rose-500/10",
              className
            )}
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="truncate">{selectedDate ? formatDisplayDate(selectedDate) : "Select date"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => setSelectedValue(date ? formatDateValue(date) : "")}
            disabled={(date) => Boolean((minDate && date < minDate) || (maxDate && date > maxDate))}
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  );
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
  const { label, error, hint, required, className, children, name, defaultValue, value, disabled, id, ...rest } = props;
  const options = optionElementsToOptions(children);
  const initialValue = stringifyFieldValue(value ?? defaultValue ?? options[0]?.value ?? "");
  const [selectedValue, setSelectedValue] = React.useState(initialValue);
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find((option) => option.value === selectedValue);

  React.useEffect(() => {
    if (value !== undefined) setSelectedValue(stringifyFieldValue(value));
  }, [value]);

  if (options.length === 0) {
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
          id={id}
          name={name}
          defaultValue={defaultValue}
          value={value}
          disabled={disabled}
          className={cn(
            "h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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

  return (
    <label className="grid gap-2 text-sm">
      {label ? (
        <span className="font-medium text-foreground">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </span>
      ) : null}
      <input type="hidden" name={name} value={selectedValue} disabled={disabled} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-expanded={open}
            aria-invalid={Boolean(error)}
            className={cn(
              "h-11 w-full justify-between rounded-md border-input bg-background px-3 text-left text-sm font-normal",
              !selectedOption && "text-muted-foreground",
              error && "border-rose-400 ring-2 ring-rose-500/10",
              className
            )}
          >
            <span className="truncate">{selectedOption?.label ?? "Select option"}</span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={`${option.value}-${option.label}`}
                    value={`${option.label} ${option.value}`}
                    disabled={option.disabled}
                    onSelect={() => {
                      setSelectedValue(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("h-4 w-4", selectedValue === option.value ? "opacity-100" : "opacity-0")} aria-hidden />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  );
}

function stringifyFieldValue(value: unknown) {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return String(value[0] ?? "");
  return String(value);
}

function parseDateValue(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function optionElementsToOptions(children: React.ReactNode) {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(child) || child.type !== "option") return [];
    const value = stringifyFieldValue(child.props.value ?? child.props.children);
    const label = stringifyOptionLabel(child.props.children) || value;
    return [{ value, label, disabled: child.props.disabled }];
  });
}

function stringifyOptionLabel(children: React.ReactNode): string {
  return React.Children.toArray(children).map((child) => (typeof child === "string" || typeof child === "number" ? String(child) : "")).join("").trim();
}

export type FormActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
