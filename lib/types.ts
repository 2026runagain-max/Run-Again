export type Papel = "corredor" | "profissional";

export type Persona =
  | "returnista"
  | "iniciante_consciente"
  | "amador_ambicioso";

// Medicina do Esporte foi removida da estratégia de produto (decisão de
// produto: sem médico do esporte, ortopedista ou avaliação médica na
// equipe do Run Again) — não readicionar sem revisar essa decisão.
export type Especialidade =
  | "fisioterapia"
  | "educacao_fisica"
  | "nutricao_esportiva"
  | "psicologia_esporte";

export interface Sessao {
  nome: string;
  papel: Papel;
  persona: Persona | null;
  // Item 14 (feedback da Marina) — foto de perfil, pra Avatar mostrar no
  // header assim que houver uma; null até o corredor enviar a primeira.
  fotoUrl: string | null;
}
