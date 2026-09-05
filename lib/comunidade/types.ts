// Tipos do fluxo de Comunidade (Feed de Evidências + Espaço Único de
// Discussão). Espelham o schema de supabase/migrations/0008_comunidade.sql
// — nomes de coluna em snake_case, mesma convenção de
// lib/psicologia/types.ts.

import type { Especialidade } from "@/lib/types";

export type TipoPostComunidade = "evidencia" | "conversa";

// As 4 evidências elegíveis do §1 do PRD (RF01) — todas hoje originadas do
// painel geral/Fisioterapia (ver nota (a) de 0008_comunidade.sql).
export type TipoEvidenciaComunidade = "risco" | "carga_forma" | "aderencia" | "insight";

export interface PostComunidade {
  id: string;
  autor_id: string;
  autor_nome: string; // snapshot no momento do post — nunca uma 2ª leitura de usuarios (ver migração)
  tipo: TipoPostComunidade;
  origem_pilar: Especialidade | null;
  tipo_evidencia: TipoEvidenciaComunidade | null;
  texto_evidencia: string | null;
  legenda: string | null;
  titulo: string | null;
  corpo: string | null;
  deletado_em: string | null;
  criado_em: string;
}

export interface RespostaComunidade {
  id: string;
  topico_id: string;
  autor_id: string;
  autor_nome: string;
  corpo: string;
  deletado_em: string | null;
  criado_em: string;
}

// RF03/RF04 — post de evidência já com o que o feed precisa por item, sem
// consulta extra por post (contagem de reação + "eu já reagi").
export interface PostFeedComunidade extends PostComunidade {
  totalReacoes: number;
  euReagi: boolean;
}

// RF06/RF07 — tópico do espaço de conversa já com suas respostas carregadas.
export interface TopicoComunidade extends PostComunidade {
  respostas: RespostaComunidade[];
}

// RF01 — resultado da checagem de elegibilidade de um tipo de evidência
// específico, computado em lib/comunidade/calculo.ts a partir do dado que o
// painel/evolução já carregaram (nunca uma consulta nova ao Fluxo 3 —
// regra §6 do PRD: "nunca uma segunda fonte de verdade").
export interface ElegibilidadeCompartilhar {
  elegivel: boolean;
  chave: string;
  textoEvidencia: string;
}
