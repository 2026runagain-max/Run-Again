import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SuccessState } from "@/components/estados/SuccessState";
import { OrientacaoView } from "@/components/nutricao/OrientacaoView";
import { EstadoEducativo } from "@/components/nutricao/EstadoEducativo";
import { createClient } from "@/lib/supabase/server";
import { sincronizarComVolumeDeTreinoAction } from "@/lib/nutricao/actions";
import { getAvaliacaoNutricionalAtual, getOrientacaoVigente } from "@/lib/nutricao/queries";
import { estados } from "@/lib/nutricao/copy";
import { NUTRICIONISTA_RESPONSAVEL_NOME } from "@/lib/nutricao/motor";

export const metadata: Metadata = { title: "Minha orientação — Run Again" };

export default async function MinhaOrientacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>;
}) {
  const { novo } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const avaliacao = await getAvaliacaoNutricionalAtual(user.id);
  if (!avaliacao?.concluida_em) {
    redirect("/corredor/nutricao/avaliacao");
  }

  // RF06 — recálculo automático silencioso, antes de renderizar (nunca
  // exige ação do corredor). No-op na maioria das visitas — ver a
  // documentação de limites em lib/nutricao/actions.ts.
  await sincronizarComVolumeDeTreinoAction(user.id);

  const orientacao = await getOrientacaoVigente(user.id);

  // RF04-CA2/RF09-CA3 — a decisão do que mostrar segue a EXISTÊNCIA de uma
  // orientação gravada, nunca só o nível de automação da triagem: um caso
  // N4 que a equipe já avaliou e liberou (origem 'definida_pela_equipe') tem
  // uma orientação real pra mostrar, mesmo a triagem automática tendo
  // bloqueado o cálculo automático. Só cai no conteúdo educativo genérico
  // quando não existe orientação nenhuma ainda.
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow>MINHA ORIENTAÇÃO</Eyebrow>
        <h1 className="mt-1 font-display text-3xl text-ink">Sua orientação nutricional</h1>
      </div>

      {novo === "1" && orientacao?.origem === "calculada" && (
        <SuccessState subtitulo={estados.sucessoCalculada(NUTRICIONISTA_RESPONSAVEL_NOME)} />
      )}

      {orientacao ? (
        <OrientacaoView orientacao={orientacao} />
      ) : (
        <EstadoEducativo comAvisoSeguranca={avaliacao.ultimo_nivel_automacao === "n4"} />
      )}
    </div>
  );
}
