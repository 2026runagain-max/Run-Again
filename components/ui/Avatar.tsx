import { cn } from "@/lib/cn";

export interface AvatarProps {
  nome: string;
  // Item 14 (feedback da Marina) — foto de perfil opcional; sem foto,
  // continua caindo pras iniciais como sempre foi.
  fotoUrl?: string | null;
  className?: string;
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function Avatar({ nome, fotoUrl, className }: AvatarProps) {
  if (fotoUrl) {
    return (
      // URL do Storage já é a versão final servida (com ?v= de
      // cache-busting) — não precisa da otimização do next/image aqui.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fotoUrl}
        alt=""
        className={cn("h-9 w-9 shrink-0 rounded-full object-cover", className)}
      />
    );
  }

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
