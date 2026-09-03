import { z } from "zod";

const ERRO_CAMPO = "Escolhe uma opção pra continuar.";

export const consentimentoSaudeSchema = z.object({
  aceite: z.literal(true, { error: "Marca a caixa pra continuar — a gente precisa da sua autorização explícita." }),
});
export type ConsentimentoSaudeInput = z.infer<typeof consentimentoSaudeSchema>;

export const personaSchema = z.object({
  persona: z.enum(["returnista", "iniciante_consciente", "amador_ambicioso"], {
    error: "Escolhe a opção que mais parece com você agora.",
  }),
});
export type PersonaInput = z.infer<typeof personaSchema>;

// ---------------------------------------------------------------------------
// Bloco A — Histórico de lesão (RF03-CA1: A2–A6 só quando houveLesao = "sim")
// ---------------------------------------------------------------------------

export const blocoASchema = z
  .object({
    houveLesao: z.enum(["sim", "nao"], { error: ERRO_CAMPO }),
    regiaoLesao: z
      .enum(["joelho", "tornozelo_pe", "quadril_virilha", "posterior_coxa", "lombar", "canela_panturrilha", "outra"])
      .optional(),
    descricaoLesao: z.string().trim().max(500).optional(),
    tratamentoLesao: z.enum(["fisioterapia_profissional", "conta_propria", "nao_tratou", "ainda_tratando"]).optional(),
    situacaoAtualLesao: z.enum(["totalmente_resolvida", "ainda_sinto_as_vezes", "ainda_me_limita"]).optional(),
    tempoParado: z.enum(["menos_1_mes", "1_a_3_meses", "3_a_6_meses", "mais_6_meses"]).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.houveLesao !== "sim") return;
    const obrigatorios: (keyof typeof val)[] = ["regiaoLesao", "tratamentoLesao", "situacaoAtualLesao", "tempoParado"];
    for (const campo of obrigatorios) {
      if (!val[campo]) {
        ctx.addIssue({ code: "custom", path: [campo], message: ERRO_CAMPO });
      }
    }
  });
export type BlocoAInput = z.infer<typeof blocoASchema>;

// ---------------------------------------------------------------------------
// Bloco B — Objetivo
// ---------------------------------------------------------------------------

export const blocoBSchema = z.object({
  objetivoPrincipal: z.enum(["voltar_a_correr_sem_dor", "completar_prova", "melhorar_tempo", "criar_habito", "outro"], {
    error: ERRO_CAMPO,
  }),
  provaAlvo: z.string().trim().max(120).optional(),
  prazoObjetivo: z.enum(["sem_prazo", "3_meses", "6_meses", "1_ano_mais"], { error: ERRO_CAMPO }),
});
export type BlocoBInput = z.infer<typeof blocoBSchema>;

// ---------------------------------------------------------------------------
// Bloco C — Rotina de treino atual
// ---------------------------------------------------------------------------

export const blocoCSchema = z.object({
  frequenciaSemanal: z.enum(["nao_treino_agora", "1_2x", "3_4x", "5x_mais"], { error: ERRO_CAMPO }),
  volumeAtualKm: z.coerce.number().min(0).max(300).optional(),
  experienciaCorrida: z.enum(["menos_1_ano", "1_a_3_anos", "mais_3_anos"], { error: ERRO_CAMPO }),
});
export type BlocoCInput = z.infer<typeof blocoCSchema>;

// ---------------------------------------------------------------------------
// Bloco D — Sono e alimentação
// ---------------------------------------------------------------------------

export const blocoDSchema = z.object({
  qualidadeSono: z.enum(["ruim", "regular", "boa"], { error: ERRO_CAMPO }),
  horasSono: z.enum(["menos_6h", "6_a_7h", "7_a_9h", "mais_9h"], { error: ERRO_CAMPO }),
  alimentacaoPercebida: z.enum(["desorganizada", "razoavel", "estruturada"], { error: ERRO_CAMPO }),
});
export type BlocoDInput = z.infer<typeof blocoDSchema>;

// ---------------------------------------------------------------------------
// Bloco E — Perfil psicológico (E2 muda de copy por persona — RF02-CA3)
// ---------------------------------------------------------------------------

export const blocoESchema = z.object({
  medoLesionar: z.coerce.number().int().min(0).max(10),
  receioPrincipal: z.enum(
    ["nova_lesao", "nao_evoluir_como_antes", "nao_atingir_meta", "frustracao_com_processo", "nada_disso_me_preocupa"],
    { error: ERRO_CAMPO },
  ),
  motivacaoPrincipal: z.enum(
    ["saude_bem_estar", "superacao_pessoal", "performance_competitiva", "disciplina_rotina", "comunidade_pertencimento"],
    { error: ERRO_CAMPO },
  ),
});
export type BlocoEInput = z.infer<typeof blocoESchema>;

// ---------------------------------------------------------------------------
// Bloco F — Rotina e carga de vida (sinal qualitativo, §6 do PRD de produto)
// ---------------------------------------------------------------------------

export const blocoFSchema = z.object({
  desafioRotina: z.enum(["falta_tempo", "cansaco_estresse", "falta_lugar_seguro", "falta_constancia", "nenhum_desafio_grande"], {
    error: ERRO_CAMPO,
  }),
  nivelMovimentoDia: z.enum(["sentado_maior_parte", "alterno_sentado_em_pe", "ativo_o_dia_todo"], { error: ERRO_CAMPO }),
  tempoDisponivelSemana: z.enum(["menos_2h", "2_a_4h", "4_a_6h", "mais_6h"], { error: ERRO_CAMPO }),
});
export type BlocoFInput = z.infer<typeof blocoFSchema>;

// ---------------------------------------------------------------------------
// Bloco G — Ambiente e equipamento
// ---------------------------------------------------------------------------

export const blocoGSchema = z.object({
  localTreino: z.enum(["rua_parque", "esteira", "pista_atletismo", "trilha", "variado"], { error: ERRO_CAMPO }),
  acessoEquipamento: z.enum(["nenhum", "tenis_adequado_apenas", "academia_completa"], { error: ERRO_CAMPO }),
  observacaoAmbiente: z.string().trim().max(500).optional(),
});
export type BlocoGInput = z.infer<typeof blocoGSchema>;

// ---------------------------------------------------------------------------
// Bloco H — Contexto final
// ---------------------------------------------------------------------------

export const blocoHSchema = z.object({
  prioridadeAgora: z.enum(["nao_lesionar_de_novo", "evoluir_rapido", "entender_meu_corpo", "ter_constancia"], {
    error: ERRO_CAMPO,
  }),
  expectativaAcompanhamento: z.enum(["quero_muito_contato", "prefiro_autonomia_com_suporte", "ainda_nao_sei"], {
    error: ERRO_CAMPO,
  }),
  algoMais: z.string().trim().max(500).optional(),
});
export type BlocoHInput = z.infer<typeof blocoHSchema>;

export const BLOCO_SCHEMAS = {
  blocoA: blocoASchema,
  blocoB: blocoBSchema,
  blocoC: blocoCSchema,
  blocoD: blocoDSchema,
  blocoE: blocoESchema,
  blocoF: blocoFSchema,
  blocoG: blocoGSchema,
  blocoH: blocoHSchema,
} as const;
