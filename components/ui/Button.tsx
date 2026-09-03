import Link from "next/link";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "ghost" | "fire-ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-fire text-white hover:bg-fire/90 focus-visible:ring-fire disabled:bg-fire/40",
  ghost:
    "border border-white/18 text-white hover:bg-white/10 focus-visible:ring-white disabled:text-white/40 disabled:border-white/10",
  "fire-ghost":
    "bg-fire-dim border border-fire/30 text-fire-text hover:bg-fire/25 focus-visible:ring-fire disabled:opacity-40",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", loading, disabled, className, children, href, ...props },
    ref,
  ) => {
    const classes = cn(baseClasses, variantClasses[variant], className);

    if (href) {
      return (
        <Link href={href} className={classes} aria-disabled={disabled}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
