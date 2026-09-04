import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { pilaresProduto } from "@/lib/site/pilares-produto";

export const metadata: Metadata = {
  title: "Método — Run Again",
  description:
    "Os 6 pilares do ecossistema Run Again explicados em profundidade: fisioterapia, preparação física, nutrição esportiva, medicina do esporte, psicologia do esporte e comunidade.",
};

export default function MetodoPage() {
  return (
    <main>
      <section className="bg-ink px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow dark>O método</Eyebrow>
          <h1 className="mt-2 font-display text-4xl leading-tight text-white sm:text-5xl">
            Seis pilares, um só protocolo.
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-silver">
            Nenhum concorrente integra fisioterapia, preparação física, nutrição,
            medicina e psicologia do esporte numa jornada só. Cada pilar abaixo existe
            porque, sozinho, nenhum dos outros cinco evita lesão nem sustenta evolução.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="flex flex-col gap-6">
          {pilaresProduto.map((pilar, i) => (
            <Card key={pilar.slug} variant="pillar" className="flex flex-col gap-3 sm:flex-row sm:gap-6">
              <div className="flex items-center gap-3 sm:w-48 sm:shrink-0 sm:flex-col sm:items-start">
                <span className="text-3xl" aria-hidden="true">
                  {pilar.emoji}
                </span>
                <h2 className="font-display text-2xl text-ink">{pilar.nome}</h2>
              </div>
              <div>
                <p className="font-sans text-sm font-semibold text-fire-text">
                  {String(i + 1).padStart(2, "0")} — {pilar.descricaoCurta}
                </p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-mid">
                  {pilar.descricaoLonga}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
