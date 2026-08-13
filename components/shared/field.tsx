"use client";

import { useId, useState } from "react";
import { ChevronDown, Eye, EyeOff, type LucideIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const CONTROL =
  "h-12 rounded-xl border-input bg-card ps-11 pe-3.5 text-sm shadow-none";

export function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="text-brand-ink ml-0.5">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

export function FieldLabel({
  htmlFor,
  children,
  required = false,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <Label htmlFor={htmlFor}>
      {children}
      {required ? <RequiredMark /> : null}
    </Label>
  );
}

export function Field({
  name,
  label,
  error,
  hint,
  icon: Icon,
  action,
  className,
  type = "text",
  required,
  ...props
}: React.ComponentProps<typeof Input> & {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  const helpId = useId();
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel htmlFor={name} required={required}>
          {label}
        </FieldLabel>
        {action}
      </div>

      <div className="relative">
        {Icon ? (
          <Icon
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute inset-y-0 start-4 my-auto size-4.5"
          />
        ) : null}

        <Input
          id={name}
          name={name}
          type={isPassword && revealed ? "text" : type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? helpId : undefined}
          className={cn(
            CONTROL,
            !Icon && "ps-3.5",
            isPassword && "pe-12",
            className,
          )}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((shown) => !shown)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute inset-y-0 end-2 my-auto flex size-8 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-3"
          >
            {revealed ? (
              <EyeOff className="size-4.5" />
            ) : (
              <Eye className="size-4.5" />
            )}
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={helpId} className="text-destructive text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={helpId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="bg-destructive/10 text-destructive rounded-xl px-3.5 py-3 text-sm"
    >
      {children}
    </p>
  );
}

export function TextareaField({
  name,
  label,
  error,
  hint,
  required,
  className,
  ...props
}: React.ComponentProps<"textarea"> & {
  name: string;
  label: string;
  error?: string;
  hint?: string;
}) {
  const helpId = useId();

  return (
    <div className="grid gap-2">
      <FieldLabel htmlFor={name} required={required}>
        {label}
      </FieldLabel>

      <textarea
        id={name}
        name={name}
        rows={props.rows ?? 3}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? helpId : undefined}
        className={cn(
          "border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive rounded-xl border px-3.5 py-3 text-sm leading-relaxed outline-none focus-visible:ring-3",
          className,
        )}
        {...props}
      />

      {error ? (
        <p id={helpId} className="text-destructive text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={helpId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export type SelectOption = { value: string; label: string };

export function SelectField({
  name,
  label,
  options,
  error,
  hint,
  required,
  placeholder,
  className,
  ...props
}: Omit<React.ComponentProps<"select">, "children"> & {
  name: string;
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  placeholder?: string;
}) {
  const helpId = useId();

  return (
    <div className="grid gap-2">
      <FieldLabel htmlFor={name} required={required}>
        {label}
      </FieldLabel>

      <div className="relative">
        <select
          id={name}
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? helpId : undefined}
          className={cn(
            "border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive h-12 w-full appearance-none rounded-xl border px-3.5 pe-10 text-sm outline-none focus-visible:ring-3",
            className,
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute inset-y-0 end-3.5 my-auto size-4"
        />
      </div>

      {error ? (
        <p id={helpId} className="text-destructive text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={helpId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
