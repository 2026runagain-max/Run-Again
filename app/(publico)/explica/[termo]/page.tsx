import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { ListaFundadorasForm } from "@/components/marketing/ListaFundadorasForm";
import { termos, getTermo } from "@/lib/explica/content";

// Mesma regra do blog (§12 do PRD): template pronto, sem termo inventado.
export function generateStaticParams() {
  return termos.map((termo) => ({ termo: termo.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ termo: string }>;
}): Promise<Metadata> {
  const { termo: slug } = await params;
  const termo = getTermo(slug);
  if (!termo) return { title: "Termo não encontrado — Run Again" };

  return {
    title: `${termo.termo} — Run Again Explica`,
    description: termo.resumo,
  };
}

export default async function TermoPage({
  params,
}: {
  params: Promise<{ termo: string }>;
}) {
  const { termo: slug } = await params;
  const termo = getTermo(slug);
  if (!termo) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-sans text-sm text-mid">
        <Link href="/explica" className="hover:underline">
          Run Again Explica
        </Link>
      </p>

      <Eyebrow className="mt-4">Run Again Explica</Eyebrow>
      <h1 className="mt-2 font-display text-4xl leading-tight text-ink">{termo.termo}</h1>
      <p className="mt-3 font-sans text-xs text-mid">
        Revisado por {termo.revisorNome} ({termo.revisorCredencial})
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {termo.corpo.split("\n\n").map((paragrafo, i) => (
          <p key={i} className="font-sans text-base leading-[1.7] text-ink">
            {paragrafo}
          </p>
        ))}
      </div>

      <Card variant="insight" className="mt-12">
        <Eyebrow>Continue por aqui</Eyebrow>
        <h2 className="mt-2 font-display text-2xl text-ink">
          Entra na lista de fundadoras
        </h2>
        <ListaFundadorasForm origem="explica" className="mt-5" />
      </Card>
    </main>
  );
}
