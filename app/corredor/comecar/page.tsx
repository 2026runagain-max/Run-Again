import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvaliacaoWizard } from "@/components/avaliacao/AvaliacaoWizard";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { getAvaliacaoAtual, getPerfilAvaliacao, primeiroBlocoIncompleto } from "@/lib/avaliacao/queries";
import { CHAVES_BLOCOS, type RespostasAvaliacao } from "@/lib/avaliacao/types";

export const metadata: Metadata = { title: "Sua avaliação — Run Again" };

// QA do beta — rótulo pro banner de "por que caí aqui" (ver comentário em
// lib/supabase/middleware.ts). Prefixo, não igualdade exata: cobre
// sub-rotas como /corredor/psicologia/check-in.
const ROTULO_POR_PREFIXO: [string, string][] = [
  ["/corredor/nutricao", "Nutrição"],
  ["/corredor/psicologia", "Psicologia do Esporte"],
  ["/corredor/comunidade", "Comunidade"],
  ["/corredor/minha-recuperacao", "Minha Recuperação"],
  ["/corredor/painel", "seu painel"],
];

function rotuloBloqueado(pathname: string | undefined): string | null {
  if (!pathname) return null;
  const encontrado = ROTULO_POR_PREFIXO.find(([prefixo]) => pathname.startsWith(prefixo));
  return encontrado?.[1] ?? null;
}

export default async function ComecarPage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string; bloqueado?: string }>;
}) {
  const { modo, bloqueado } = await searchParams;
  const rotuloDaRotaBloqueada = rotuloBloqueado(bloqueado);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [perfil, avaliacao] = await Promise.all([getPerfilAvaliacao(user.id), getAvaliacaoAtual(user.id)]);

  // "Editar" (SHOULD — item 9 do PRD de produto) só existe quando já há uma
  // avaliação concluída pra reabrir — sem isso, a query string cai no
  // fluxo normal de retomada (senão alguém no meio da primeira avaliação
  // com esse parâmetro na URL reiniciaria do Bloco A em vez de retomar de
  // onde parou).
  const emEdicao = modo === "editar" && !!avaliacao?.concluida_em;

  // Avaliação já concluída: só volta pro wizard se for edição explícita.
  // Do contrário, o lugar certo é a tela de diagnóstico.
  if (avaliacao?.concluida_em && !emEdicao) {
    redirect("/corredor/diagnostico");
  }

  const respostas = (avaliacao?.respostas ?? {}) as RespostasAvaliacao;

  let passoInicial: number;
  if (!perfil?.consentimentoSaudeEm) {
    passoInicial = 0; // intro + consentimento
  } else if (!perfil.persona) {
    passoInicial = 2; // ponto de partida
  } else if (emEdicao) {
    passoInicial = 3; // reabre no Bloco A, tudo pré-preenchido
  } else {
    const chave = primeiroBlocoIncompleto(avaliacao);
    passoInicial = chave ? 3 + CHAVES_BLOCOS.indexOf(chave) : 11;
  }

  return (
    <div className="py-4">
      {rotuloDaRotaBloqueada && (
        <div className="mx-auto mb-6 max-w-2xl px-4 sm:px-6">
          <Card variant="insight">
            <p className="font-sans text-sm text-ink">
              {rotuloDaRotaBloqueada === "seu painel"
                ? "Seu painel abre assim que você termina esta avaliação — é o que constrói o retrato que ele mostra."
                : `${rotuloDaRotaBloqueada} abre assim que você termina esta avaliação — é o que dá à Equipe Run Again o retrato pra te acompanhar aí.`}
            </p>
          </Card>
        </div>
      )}
      <AvaliacaoWizard passoInicial={passoInicial} personaAtual={perfil?.persona ?? null} respostas={respostas} />
    </div>
  );
}
