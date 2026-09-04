import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/estados/EmptyState";
import { ExercicioCheckbox } from "@/components/fisioterapia/ExercicioCheckbox";
import { Resposta24hForm } from "@/components/fisioterapia/Resposta24hForm";
import {
  getExerciciosDaSessao,
  getPerfilCorredorPrescricao,
  getRespostaMaisRecenteDaSessao,
  getSessaoVisivelMaisRecente,
} from "@/lib/fisioterapia/queries";
import { corredorCopy } from "@/lib/fisioterapia/copy";

export const metadata: Metadata = { title: "Sessão de hoje — Run Again" };

export default async function SessaoDeHojePage() {
  const perfil = await getPerfilCorredorPrescricao();
  if (!perfil) return null;

  const sessao = await getSessaoVisivelMaisRecente(perfil.id);

  if (!sessao) {
    return <EmptyState titulo="Sua sessão ainda está sendo desenhada." subtitulo={corredorCopy.vazioSemSessao} />;
  }

  const [exercicios, respostaRecente] = await Promise.all([
    getExerciciosDaSessao(sessao.id),
    getRespostaMaisRecenteDaSessao(sessao.id),
  ]);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          SESSÃO DE HOJE
        </p>
        {/* O H1 nunca mostra o rótulo interno da sessão (sessao.titulo) — é
            texto de trabalho do profissional, não algo dito a você. */}
        <h1 className="mt-1 font-display text-3xl text-ink">O que treinar hoje</h1>
        {sessao.observacoes && <p className="mt-2 font-sans text-sm text-mid">{sessao.observacoes}</p>}
      </div>

      <Card variant="pillar" className="flex flex-col gap-4">
        {exercicios.length === 0 ? (
          <p className="text-sm font-sans text-mid">Nenhum exercício nesta sessão ainda.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {exercicios.map((se) => (
              <li key={se.id} className="flex items-start justify-between gap-4 border-b border-mid/10 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-sans text-base font-bold text-ink">{se.exercicio.nome}</p>
                  <p className="mt-0.5 text-sm font-sans font-semibold text-fire-text">
                    {[
                      se.series ? `${se.series} séries` : null,
                      se.repeticoes ? `${se.repeticoes} repetições` : null,
                      se.carga_ou_tempo,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-2 text-sm font-sans leading-relaxed text-mid">
                    {se.exercicio.explicacao_corredor}
                  </p>
                </div>
                <ExercicioCheckbox sessaoExercicioId={se.id} concluidoInicial={se.concluido_pelo_corredor} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Resposta24hForm sessaoId={sessao.id} jaRespondida={!!respostaRecente} />
    </div>
  );
}
