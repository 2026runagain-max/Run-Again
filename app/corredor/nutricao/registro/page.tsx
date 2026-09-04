import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyState } from "@/components/estados/EmptyState";
import { RegistroAlimentarForm } from "@/components/nutricao/RegistroAlimentarForm";
import { ListaRegistrosAlimentares } from "@/components/nutricao/ListaRegistrosAlimentares";
import { CheckinNutricaoForm } from "@/components/nutricao/CheckinNutricaoForm";
import { createClient } from "@/lib/supabase/server";
import { getRegistrosAlimentares } from "@/lib/nutricao/queries";
import { estados } from "@/lib/nutricao/copy";

export const metadata: Metadata = { title: "Registro alimentar — Run Again" };

// Decisão de tela (não fixada pelo mapa de telas do PRD): o PRD lista M10
// ("Check-ins de fome, energia, GI, hidratação") como uma das entradas de
// RF08, mas não reserva uma rota própria pra ele — só o registro alimentar
// tem tela dedicada. Os dois convivem aqui de propósito: são os dois sinais
// autorrelatados que alimentam o monitoramento (RF08), e nenhum dos dois é
// obrigatório nem bloqueia o resto do pilar (regra §6). Separar em duas
// rotas exigiria mais um item de navegação pra um fluxo opcional — não
// parece valer o custo neste beta.
export default async function RegistroAlimentarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const registros = await getRegistrosAlimentares(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow>REGISTRO ALIMENTAR</Eyebrow>
        <h1 className="mt-1 font-display text-3xl text-ink">O que você tem comido</h1>
        <p className="mt-1 text-sm font-sans text-mid">Nunca obrigatório — sua orientação funciona inteiramente sem isso.</p>
      </div>

      <RegistroAlimentarForm />

      <CheckinNutricaoForm />

      <div>
        <h2 className="font-display text-xl text-ink">Seu histórico</h2>
        {registros.length === 0 ? (
          <EmptyState subtitulo={estados.vazioRegistro} className="mt-3" />
        ) : (
          <div className="mt-3 rounded-2xl border border-mid/15 bg-white p-6">
            <ListaRegistrosAlimentares registros={registros} />
          </div>
        )}
      </div>
    </div>
  );
}
