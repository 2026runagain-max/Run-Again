// Tipos do pilar de Psicologia do Esporte.
// Espelham o schema de supabase/migrations/0007_psicologia_esportiva.sql —
// nomes de coluna em snake_case, mesma convenção de lib/fisioterapia/types.ts.

import type { ZonaResposta } from "@/lib/fisioterapia/types";

export type { ZonaResposta };

export interface CheckinPsicologia {
  id: string;
  usuario_id: string;
  c1_confianca: number;
  c2_medo: number;
  c3_disposicao: number | null;
  c4_texto_livre: string | null;
  c5_quer_conversar: boolean;
  zona: ZonaResposta;
  c4_revisado_em: string | null;
  c4_revisado_por: string | null;
  criado_em: string;
}

export interface SinalCruzadoPsicologia {
  id: string;
  usuario_id: string;
  checkin_id: string;
  zona: ZonaResposta;
  frase: string;
  criado_em: string;
}

// RF-8 — nunca persistida (§3 da migração 0007): sempre recalculada a partir
// do histórico de check-ins + banda de risco atual.
export interface CadenciaPsicologica {
  cadenciaDiasAtual: number; // 14 (quinzenal) ou 30 (mensal)
  proximoEsperadoEm: string; // ISO
  verdesConsecutivos: number;
  emAtraso: boolean;
}

// RF-5-CA2 — card de continuidade do prontuário.
export interface ResumoContinuidadePsicologia {
  totalCheckins: number;
  confiancaPrimeira: number | null;
  confiancaMaisRecente: number | null;
  zonaAtual: ZonaResposta | null;
  temTextoLivreNaoRevisado: boolean;
}

// RF-4 — uma linha da fila de atenção do psicólogo.
export interface FilaAtencaoItem {
  pacienteId: string;
  nome: string;
  persona: string | null;
  zonaAtual: ZonaResposta | null;
  temTextoLivreNaoRevisado: boolean;
  ultimoCheckinEm: string | null;
  cadencia: CadenciaPsicologica | null;
}
