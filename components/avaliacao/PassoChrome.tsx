import { Eyebrow } from "@/components/ui/Eyebrow";

export interface PassoChromeProps {
  eyebrow: string;
  titulo: string;
  tituloDestaque?: string;
  corpo?: string;
  children: React.ReactNode;
}

export function PassoChrome({ eyebrow, titulo, tituloDestaque, corpo, children }: PassoChromeProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-2 font-display text-2xl leading-tight text-ink sm:text-3xl">
          {titulo}
          {tituloDestaque && <span className="text-fire"> {tituloDestaque}</span>}
        </h1>
        {corpo && <p className="mt-3 font-sans text-sm leading-relaxed text-mid">{corpo}</p>}
      </div>
      {children}
    </div>
  );
}

export function ProgressoAvaliacao({ atual, total }: { atual: number; total: number }) {
  const pct = Math.round((atual / total) * 100);
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex items-center justify-between text-xs font-sans text-mid">
        <span>
          Passo {atual} de {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-smoke">
        <div className="h-full rounded-full bg-fire transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
