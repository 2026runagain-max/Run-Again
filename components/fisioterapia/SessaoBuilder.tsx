"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Input, Select } from "@/components/ui";
import { Card } from "@/components/ui/Card";
import { ConfirmActionButton } from "@/components/fisioterapia/ConfirmActionButton";
import {
  adicionarExercicioSessaoAction,
  enviarSessaoParaCorredorAction,
  ocultarSessaoAction,
  removerExercicioSessaoAction,
} from "@/lib/fisioterapia/actions";
import { capacidadeLabelProfissional } from "@/lib/fisioterapia/labels";
import type {
  ExercicioCatalogo,
  SessaoExercicioComDetalhe,
  SessaoPrescrita,
} from "@/lib/fisioterapia/types";

export function SessaoBuilder({
  sessao,
  exercicios,
  catalogo,
  pacienteId,
}: {
  sessao: SessaoPrescrita;
  exercicios: SessaoExercicioComDetalhe[];
  catalogo: ExercicioCatalogo[];
  pacienteId: string;
}) {
  const acaoAdicionar = adicionarExercicioSessaoAction.bind(
    null,
    sessao.id,
    pacienteId,
    exercicios.length,
  );
  const [state, formAction, pending] = useActionState(acaoAdicionar, null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      // A lista de exercícios acima é renderizada pelo Server Component pai —
      // precisa buscar de novo pra mostrar o item recém-adicionado.
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="flex flex-col gap-6">
      <Card variant="pillar" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">Status</p>
          {sessao.visivel_para_corredor ? (
            <Badge>Visível para o corredor</Badge>
          ) : (
            <span className="text-sm font-sans text-mid">Ainda não enviada — só você vê.</span>
          )}
        </div>

        {sessao.visivel_para_corredor ? (
          <ConfirmActionButton
            label="Ocultar do corredor"
            variant="ghost"
            className="border-ink text-ink hover:bg-ink/5"
            confirmTitulo="Ocultar esta sessão?"
            confirmCorpo="O corredor deixa de ver esta sessão até você enviar de novo. O que já foi respondido em 'como foi' continua salvo no prontuário."
            confirmLabel="Ocultar"
            action={() => ocultarSessaoAction(sessao.id, pacienteId)}
          />
        ) : (
          <ConfirmActionButton
            label="Enviar para o corredor"
            confirmTitulo="Enviar esta sessão para o corredor?"
            confirmCorpo="A partir de agora ela fica visível na área dele, com os exercícios e a dose que você montou aqui. Você pode editar ou ocultar depois, a qualquer momento."
            confirmLabel="Enviar"
            action={() => enviarSessaoParaCorredorAction(sessao.id, pacienteId)}
          />
        )}
      </Card>

      <Card variant="pillar" className="flex flex-col gap-4">
        <h2 className="font-display text-2xl text-ink">Exercícios da sessão</h2>

        {exercicios.length === 0 && (
          <p className="text-sm font-sans text-mid">
            Nenhum exercício ainda. Adiciona pelo menos um antes de enviar.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {exercicios.map((se) => (
            <li
              key={se.id}
              className="flex flex-col gap-2 rounded-xl border border-mid/15 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-sans text-sm font-bold text-ink">{se.exercicio.nome}</p>
                  {/* RF02-CA3 — o profissional vê o estado de conclusão que o
                      corredor registrou, sem precisar perguntar de memória. */}
                  {se.concluido_pelo_corredor && <Badge>CONCLUÍDO PELO CORREDOR</Badge>}
                </div>
                <p className="text-xs font-sans uppercase tracking-wide text-mid">
                  {capacidadeLabelProfissional[se.exercicio.capacidade]}
                </p>
                <p className="mt-1 text-sm font-sans text-mid">
                  {[
                    se.series ? `${se.series}x` : null,
                    se.repeticoes ? `${se.repeticoes}` : null,
                    se.carga_ou_tempo,
                  ]
                    .filter(Boolean)
                    .join(" ") || "Dose não definida"}
                </p>
                <p className="mt-2 text-sm font-sans italic text-mid">
                  “{se.exercicio.explicacao_corredor}”
                </p>
              </div>

              <ConfirmActionButton
                label="Remover"
                variant="fire-ghost"
                confirmTitulo="Remover este exercício da sessão?"
                confirmCorpo={`"${se.exercicio.nome}" sai da sessão. Isso não afeta o histórico do prontuário.`}
                confirmLabel="Remover"
                action={() => removerExercicioSessaoAction(se.id, sessao.id, pacienteId)}
              />
            </li>
          ))}
        </ul>

        <form ref={formRef} action={formAction} className="flex flex-col gap-3 border-t border-mid/10 pt-4">
          <Select name="exercicioId" label="Adicionar exercício do catálogo" required defaultValue="">
            <option value="" disabled>
              Escolhe um exercício
            </option>
            {catalogo.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.nome} — {capacidadeLabelProfissional[ex.capacidade]}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-3 gap-3">
            <Input name="series" type="number" min="1" max="20" label="Séries" />
            <Input name="repeticoes" type="number" min="1" max="200" label="Repetições" />
            <Input name="cargaOuTempo" label="Carga/tempo" placeholder="12kg, 30s..." />
          </div>

          {state && !state.ok && (
            <p className="text-sm font-sans text-fire-text" role="alert">
              {state.erro}
            </p>
          )}

          <Button type="submit" variant="fire-ghost" loading={pending} className="self-start">
            Adicionar à sessão
          </Button>
        </form>
      </Card>
    </div>
  );
}
