import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardVariant = "pillar" | "insight" | "persona" | "ghost";

const variantClasses: Record<CardVariant, string> = {
  pillar: "bg-white border-b-[3px] border-fire rounded-[14px] shadow-sm",
  insight: "bg-fire-dim border border-fire/25 rounded-2xl",
  persona: "bg-white border-t-4 border-fire rounded-2xl shadow-sm",
  // Feature Card / Number Card do design system — só sobre fundo --ink.
  ghost: "bg-white/[0.04] border border-white/[0.07] rounded-2xl",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({ variant = "pillar", className, ...props }: CardProps) {
  return (
    <div
      className={cn("p-6", variantClasses[variant], className)}
      {...props}
    />
  );
}
