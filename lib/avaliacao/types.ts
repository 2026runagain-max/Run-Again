import type { Persona } from "@/lib/types";

// ---------------------------------------------------------------------------
// Blocos A–H — ver nota de origem em lib/avaliacao/copy.ts
// ---------------------------------------------------------------------------

export interface BlocoA {
  houveLesao: "sim" | "nao";
  regiaoLesao?: RegiaoLesao;
  descricaoLesao?: string; // opcional (A3)
  tratamentoLesao?: TratamentoLesao;
  situacaoAtualLesao?: SituacaoAtualLesao;
  tempoParado?: TempoParado;
}

export type RegiaoLesao =
  | "joelho"
  | "tornozelo_pe"
  | "quadril_virilha"
  | "posterior_coxa"
  | "lombar"
  | "canela_panturrilha"
  | "outra";

export type TratamentoLesao =
  | "fisioterapia_profissional"
  | "conta_propria"
  | "nao_tratou"
  | "ainda_tratando";

export type SituacaoAtualLesao = "totalmente_resolvida" | "ainda_sinto_as_vezes" | "ainda_me_limita";

export type TempoParado = "menos_1_mes" | "1_a_3_meses" | "3_a_6_meses" | "mais_6_meses";

export interface BlocoB {
  objetivoPrincipal: ObjetivoPrincipal;
  provaAlvo?: string; // opcional
  prazoObjetivo: PrazoObjetivo;
}

export type ObjetivoPrincipal =
  | "voltar_a_correr_sem_dor"
  | "completar_prova"
  | "melhorar_tempo"
  | "criar_habito"
  | "outro";

export type PrazoObjetivo = "sem_prazo" | "3_meses" | "6_meses" | "1_ano_mais";

export interface BlocoC {
  frequenciaSemanal: FrequenciaSemanal;
  volumeAtualKm?: number; // opcional
  experienciaCorrida: ExperienciaCorrida;
}

export type FrequenciaSemanal = "nao_treino_agora" | "1_2x" | "3_4x" | "5x_mais";
export type ExperienciaCorrida = "menos_1_ano" | "1_a_3_anos" | "mais_3_anos";

export interface BlocoD {
  qualidadeSono: QualidadeSono;
  horasSono: HorasSono;
  alimentacaoPercebida: AlimentacaoPercebida;
}

export type QualidadeSono = "ruim" | "regular" | "boa";
export type HorasSono = "menos_6h" | "6_a_7h" | "7_a_9h" | "mais_9h";
export type AlimentacaoPercebida = "desorganizada" | "razoavel" | "estruturada";

export interface BlocoE {
  medoLesionar: number; // 0-10
  receioPrincipal: ReceioPrincipal;
  motivacaoPrincipal: MotivacaoPrincipal;
}

export type ReceioPrincipal =
  | "nova_lesao"
  | "nao_evoluir_como_antes"
  | "nao_atingir_meta"
  | "frustracao_com_processo"
  | "nada_disso_me_preocupa";

export type MotivacaoPrincipal =
  | "saude_bem_estar"
  | "superacao_pessoal"
  | "performance_competitiva"
  | "disciplina_rotina"
  | "comunidade_pertencimento";

export interface BlocoF {
  desafioRotina: DesafioRotina;
  nivelMovimentoDia: NivelMovimentoDia;
  tempoDisponivelSemana: TempoDisponivelSemana;
}

export type DesafioRotina =
  | "falta_tempo"
  | "cansaco_estresse"
  | "falta_lugar_seguro"
  | "falta_constancia"
  | "nenhum_desafio_grande";

export type NivelMovimentoDia = "sentado_maior_parte" | "alterno_sentado_em_pe" | "ativo_o_dia_todo";
export type TempoDisponivelSemana = "menos_2h" | "2_a_4h" | "4_a_6h" | "mais_6h";

export interface BlocoG {
  localTreino: LocalTreino;
  acessoEquipamento: AcessoEquipamento;
  observacaoAmbiente?: string; // opcional (G3)
}

export type LocalTreino = "rua_parque" | "esteira" | "pista_atletismo" | "trilha" | "variado";
export type AcessoEquipamento = "nenhum" | "tenis_adequado_apenas" | "academia_completa";

export interface BlocoH {
  prioridadeAgora: PrioridadeAgora;
  expectativaAcompanhamento: ExpectativaAcompanhamento;
  algoMais?: string; // opcional
}

export type PrioridadeAgora =
  | "nao_lesionar_de_novo"
  | "evoluir_rapido"
  | "entender_meu_corpo"
  | "ter_constancia";

export type ExpectativaAcompanhamento = "quero_muito_contato" | "prefiro_autonomia_com_suporte" | "ainda_nao_sei";

export interface RespostasAvaliacao {
  blocoA?: BlocoA;
  blocoB?: BlocoB;
  blocoC?: BlocoC;
  blocoD?: BlocoD;
  blocoE?: BlocoE;
  blocoF?: BlocoF;
  blocoG?: BlocoG;
  blocoH?: BlocoH;
}

export const CHAVES_BLOCOS = ["blocoA", "blocoB", "blocoC", "blocoD", "blocoE", "blocoF", "blocoG", "blocoH"] as const;
export type ChaveBloco = (typeof CHAVES_BLOCOS)[number];

// ---------------------------------------------------------------------------
// Diagnóstico (RF04/RF05)
// ---------------------------------------------------------------------------

export type BandaRisco = "baixo" | "moderado" | "alto";

export interface PontoAtencao {
  titulo: string;
  texto: string;
}

export interface Diagnostico {
  riscoScore: number;
  fraseIdentidade: string;
  bandaRisco: BandaRisco;
  bandaRiscoFrase: string;
  perfilBiomecanicoFlags: string[];
  perfilBiomecanicoFrase: string;
  perfilPsicologicoFrase: string;
  pontosAtencao: PontoAtencao[];
}

export interface AvaliacaoInicialRow {
  id: string;
  usuario_id: string;
  respostas: RespostasAvaliacao;
  risco_score: number | null;
  frase_identidade: string | null;
  banda_risco: BandaRisco | null;
  banda_risco_frase: string | null;
  perfil_biomecanico_flags: string[];
  perfil_biomecanico_frase: string | null;
  perfil_psicologico_frase: string | null;
  pontos_atencao: PontoAtencao[];
  concluida_em: string | null;
  notificado_equipe_em: string | null;
  notificacao_erro: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface PerfilAvaliacao {
  persona: Persona | null;
  consentimentoSaudeVersao: string | null;
  consentimentoSaudeEm: string | null;
}
