import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/cn";
import { getFilaCasos } from "@/lib/nutricao/queries";
import { estadosProfissional } from "@/lib/nutricao/copy";
import { FilaCasos } from "@/components/nutricao/profissional/FilaCasos";

export const metadata: Metadata = { title: "Casos de Nutrição — Run Again" };

const ABAS = [
  { valor: "seguranca", label: "Segurança" },
  { valor: "revisao", label: "Revisão" },
] as const;

export default async function CasosNutricaoPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const { aba } = await searchParams;
  const abaAtiva = aba === "revisao" ? "revisao" : "seguranca";

  const casos = await getFilaCasos(abaAtiva, ["aberto", "em_atendimento"]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow>NUTRIÇÃO ESPORTIVA</Eyebrow>
        <h1 className="mt-1 font-display text-3xl text-ink">Fila de casos</h1>
        <p className="mt-1 text-sm font-sans text-mid">
          Fila de exceção — não é uma lista de todos os corredores de nutrição, só quem precisa de você agora.
        </p>
      </div>

      <div className="flex gap-2 border-b border-mid/15">
        {ABAS.map((tab) => (
          <Link
            key={tab.valor}
            href={`/profissional/nutricao/casos?aba=${tab.valor}`}
            className={cn(
              "border-b-2 px-1 pb-3 text-sm font-semibold font-sans transition-colors",
              abaAtiva === tab.valor ? "border-fire text-ink" : "border-transparent text-mid hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <FilaCasos casos={casos} vazio={abaAtiva === "seguranca" ? estadosProfissional.vazioSeguranca : estadosProfissional.vazioRevisao} />
    </div>
  );
}
