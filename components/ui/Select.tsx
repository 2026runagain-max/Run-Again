import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, id, className, containerClassName, children, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        <label htmlFor={inputId} className="text-sm font-medium font-sans text-ink">
          {label}
        </label>
        <select
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={cn(hintId, errorId) || undefined}
          className={cn(
            "rounded-lg border bg-white px-4 py-2.5 text-sm font-sans text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-fire/30",
            error ? "border-fire" : "border-mid/40 focus:border-fire",
            props.disabled && "cursor-not-allowed bg-smoke text-mid",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {hint && !error && (
          <p id={hintId} className="text-xs font-sans text-mid">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs font-sans text-fire-text" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
