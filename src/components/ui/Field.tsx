import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { InputHTMLAttributes } from "react";

const CONTROL =
  "focus-ring w-full rounded-2xl border border-femi-200 bg-white px-4 py-3 text-[16px] text-ink placeholder:text-ink-faint transition focus:border-femi-400";

export function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-sm font-medium text-femi-700">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  invalid,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={`${CONTROL} ${invalid ? "border-femi-400" : ""} ${className}`}
    />
  );
}

export function TextArea({
  invalid,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={`${CONTROL} min-h-24 resize-y ${invalid ? "border-femi-400" : ""} ${className}`}
    />
  );
}

export function Select({
  invalid,
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      {...props}
      aria-invalid={invalid || undefined}
      className={`${CONTROL} appearance-none bg-[right_1rem_center] bg-no-repeat pr-10 ${invalid ? "border-femi-400" : ""} ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='8' viewBox='0 0 14 8'%3E%3Cpath d='M1 1l6 6 6-6' stroke='%23b92a5c' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
      }}
    >
      {children}
    </select>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-2xl border border-femi-200 bg-femi-50 px-4 py-3 text-sm font-medium text-femi-700"
    >
      {message}
    </p>
  );
}
