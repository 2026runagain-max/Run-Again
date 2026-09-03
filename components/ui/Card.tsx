import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardVariant = "pillar" | "insight";

const variantClasses: Record<CardVariant, string> = {
  pillar: "bg-white border-b-[3px] border-fire rounded-[14px] shadow-sm",
  insight: "bg-fire-dim border border-fire/25 rounded-2xl",
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
