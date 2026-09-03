import { cn } from "@/lib/cn";

export interface AvatarProps {
  nome: string;
  className?: string;
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function Avatar({ nome, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-ink-2 text-xs font-semibold font-sans text-white",
        className,
      )}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </div>
  );
}
