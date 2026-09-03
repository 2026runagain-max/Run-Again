export type Papel = "corredor" | "profissional";

export type Persona =
  | "returnista"
  | "iniciante_consciente"
  | "amador_ambicioso";

export type Especialidade =
  | "fisioterapia"
  | "educacao_fisica"
  | "nutricao_esportiva"
  | "medicina_esporte"
  | "psicologia_esporte";

export interface Sessao {
  nome: string;
  papel: Papel;
  persona: Persona | null;
}
