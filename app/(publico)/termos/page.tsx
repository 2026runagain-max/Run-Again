import type { Metadata } from "next";
import { TERMOS_VERSAO_ATUAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Termos de Uso — Run Again" };

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
        TERMOS DE USO
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink">Termos de Uso</h1>
      <p className="mt-2 font-sans text-xs text-mid">
        Versão {TERMOS_VERSAO_ATUAL} — beta fechado, sem cobrança.
      </p>
      <div className="mt-6 flex flex-col gap-4 font-sans text-sm leading-relaxed text-mid">
        <p>
          O Run Again está em fase de piloto/beta. O acesso concedido pelo código de
          convite de beta é gratuito por 90 dias a partir da criação da conta, sem
          nenhuma cobrança durante esse período.
        </p>
        <p>
          O conteúdo oferecido — protocolos de retorno ao esporte, orientação de
          preparo físico e acompanhamento clínico — não substitui avaliação médica
          presencial em casos de emergência ou agravamento agudo de sintomas.
        </p>
        <p>
          Este texto é um placeholder do fluxo de fundação técnica. A versão jurídica
          definitiva dos Termos de Uso é responsabilidade da área jurídica do Run
          Again e substituirá este conteúdo antes do lançamento público.
        </p>
      </div>
    </main>
  );
}
