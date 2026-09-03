import type { Especialidade, Persona } from "@/lib/types";

export const labelPersona: Record<Persona, string> = {
  returnista: "Returnista",
  iniciante_consciente: "Iniciante Consciente",
  amador_ambicioso: "Amador Ambicioso",
};

export const labelEspecialidade: Record<Especialidade, string> = {
  fisioterapia: "Fisioterapia",
  educacao_fisica: "Educação Física",
  nutricao_esportiva: "Nutrição Esportiva",
  medicina_esporte: "Medicina do Esporte",
  psicologia_esporte: "Psicologia do Esporte",
};
