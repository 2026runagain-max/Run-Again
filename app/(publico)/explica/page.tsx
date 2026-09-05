import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/estados/EmptyState";
import { ListaFundadorasForm } from "@/components/marketing/ListaFundadorasForm";
import { getTermos } from "@/lib/explica/content";

export const metadata: Metadata = {
  title: "Run Explica — Run Again",
  description:
    "Glossário de termos de fisioterapia, preparo físico, nutrição esportiva e psicologia do esporte, explicados em linguagem direta para o corredor amador.",
};

export default function ExplicaPage() {
  const termos = getTermos();

  return (
    <main>
      <section className="bg-ink px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow dark>Run Explica</Eyebrow>
          <h1 className="mt-2 font-display text-4xl leading-tight text-white sm:text-5xl">
            Os termos do seu retorno, sem jargão.
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-silver">
            Cada termo clínico que você vai ouvir na sua jornada de volta ao esporte,
            explicado em uma página só, com nome e credencial de quem revisou.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {termos.length === 0 ? (
          <EmptyState subtitulo="Os primeiros termos estão em produção — entra na lista de fundadores pra saber quando saírem." />
        ) : (
          <ul className="flex flex-col divide-y divide-mid/15">
            {termos.map((termo) => (
              <li key={termo.slug} className="py-4 first:pt-0 last:pb-0">
                <Link
                  href={`/explica/${termo.slug}`}
                  className="font-display text-xl text-ink hover:text-fire-text"
                >
                  {termo.termo}
                </Link>
                <p className="mt-1 text-sm font-sans text-mid">{termo.resumo}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <Card variant="insight">
          <Eyebrow>Não perca os próximos termos</Eyebrow>
          <h2 className="mt-2 font-display text-2xl text-ink">
            Entra na lista de fundadores
          </h2>
          <ListaFundadorasForm origem="explica" className="mt-5" />
        </Card>
      </section>
    </main>
  );
}
