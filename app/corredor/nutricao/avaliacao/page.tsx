import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvaliacaoNutricionalWizard, type PassoChaveAvaliacaoNutricao } from "@/components/nutricao/AvaliacaoNutricionalWizard";
import { createClient } from "@/lib/supabase/server";
import { getAvaliacaoAtual } from "@/lib/avaliacao/queries";
import { getAvaliacaoNutricionalAtual, primeiroBlocoIncompletoNutricao } from "@/lib/nutricao/queries";
import type { RespostasAvaliacaoNutricao } from "@/lib/nutricao/types";

export const metadata: Metadata = { title: "Sua avaliação nutricional — Run Again" };

export default async function AvaliacaoNutricaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Pré-requisito de acesso (regra §6 do PRD de Nutrição): persona definida
  // (já garantido pelo middleware) e diagnóstico do Fluxo 2 concluído — não é
  // burocracia, é o que permite pular persona/objetivo/Bloco C/G aqui
  // (RF01-CA1). O painel já é o lugar canônico que orienta a concluir a
  // avaliação inicial quando ela não existe ou está pela metade.
  const avaliacaoFluxo2 = await getAvaliacaoAtual(user.id);
  if (!avaliacaoFluxo2?.concluida_em) {
    redirect("/corredor/painel");
  }

  const avaliacao = await getAvaliacaoNutricionalAtual(user.id);

  if (avaliacao?.concluida_em) {
    redirect("/corredor/nutricao/minha-orientacao");
  }

  const chave = avaliacao ? primeiroBlocoIncompletoNutricao(avaliacao) : null;
  const passoInicial: PassoChaveAvaliacaoNutricao = avaliacao ? (chave ?? "concluindo") : "intro";
  const respostas = (avaliacao?.respostas ?? {}) as RespostasAvaliacaoNutricao;

  return (
    <div className="py-4">
      <AvaliacaoNutricionalWizard passoInicial={passoInicial} respostas={respostas} />
    </div>
  );
}
