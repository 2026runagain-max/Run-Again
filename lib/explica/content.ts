/**
 * Fonte de conteúdo do "Run Again Explica". Vazia de propósito — mesma
 * regra do blog (lib/blog/content.ts): nenhum termo inventado nesta tarefa,
 * conteúdo real entra depois via Pull Request (§12 do PRD "Site Aberto").
 */
export interface Termo {
  slug: string;
  termo: string;
  resumo: string;
  corpo: string;
  revisorNome: string;
  revisorCredencial: string;
  publicadoEm: string; // ISO 8601
}

export const termos: Termo[] = [];

export function getTermos(): Termo[] {
  return [...termos].sort((a, b) => a.termo.localeCompare(b.termo, "pt-BR"));
}

export function getTermo(slug: string): Termo | undefined {
  return termos.find((t) => t.slug === slug);
}
