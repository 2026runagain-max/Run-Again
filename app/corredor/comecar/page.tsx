import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvaliacaoWizard } from "@/components/avaliacao/AvaliacaoWizard";
import { createClient } from "@/lib/supabase/server";
import { getAvaliacaoAtual, getPerfilAvaliacao, primeiroBlocoIncompleto } from "@/lib/avaliacao/queries";
import { CHAVES_BLOCOS, type RespostasAvaliacao } from "@/lib/avaliacao/types";

export const metadata: Metadata = { title: "Sua avaliação — Run Again" };

export default async function ComecarPage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string }>;
}) {
  const { modo } = await searchParams;

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
      <AvaliacaoWizard passoInicial={passoInicial} personaAtual={perfil?.persona ?? null} respostas={respostas} />
    </div>
  );
}
