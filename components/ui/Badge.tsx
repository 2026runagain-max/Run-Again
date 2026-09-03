import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Badge({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-fire-dim border border-fire/30 px-3 py-1 text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
