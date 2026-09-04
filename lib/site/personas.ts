import { personaCopy } from "@/lib/avaliacao/copy";
import type { Persona } from "@/lib/types";

/**
 * Personas da "tribo" Run Again, para o Persona Card do site aberto
 * (/sobre, §6.6 do PRD "Site Aberto"). Reaproveita o texto já aprovado de
 * `personaCopy.opcoes` (usado no wizard de diagnóstico, lib/avaliacao/copy.ts)
 * em vez de reescrever — o título de cada opção já é uma frase em primeira
 * pessoa, então funciona como a "quote" pedida pelo design system sem
 * inventar nenhuma fala nova.
 */
export interface PersonaSite {
  valor: Persona;
  emoji: string;
  quote: string;
  descricao: string;
}

const emojiPorPersona: Record<Persona, string> = {
  returnista: "🔁",
  iniciante_consciente: "🌱",
  amador_ambicioso: "📈",
};

export const personasSite: PersonaSite[] = personaCopy.opcoes.map((opcao) => ({
  valor: opcao.valor,
  emoji: emojiPorPersona[opcao.valor],
  quote: opcao.titulo,
  descricao: opcao.descricao,
}));
