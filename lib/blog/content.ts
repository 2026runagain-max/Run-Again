/**
 * Fonte de conteúdo do blog. Vazia de propósito — §12 do PRD "Site Aberto"
 * define que todo artigo novo entra por Pull Request (Claude Code), nunca
 * inventado nesta tarefa. Quando o primeiro artigo for escrito, ele vira uma
 * entrada neste array (ou este arquivo evolui pra ler de uma pasta de
 * conteúdo — o que fizer mais sentido no momento); os componentes de
 * `/blog` já sabem renderizar tanto a lista vazia quanto uma lista real, sem
 * precisar mudar.
 */
import type { PilarBlog } from "./pilares";

export interface Artigo {
  slug: string;
  pilar: PilarBlog["slug"];
  titulo: string;
  resumo: string;
  corpo: string;
  autorNome: string;
  revisorNome: string;
  revisorCredencial: string;
  publicadoEm: string; // ISO 8601
  destaque?: boolean;
}

export const artigos: Artigo[] = [];

export function getDestaques(limite = 4): Artigo[] {
  return artigos
    .filter((a) => a.destaque)
    .sort((a, b) => (a.publicadoEm < b.publicadoEm ? 1 : -1))
    .slice(0, limite);
}

export function getArtigosPorPilar(pilarSlug: string): Artigo[] {
  return artigos
    .filter((a) => a.pilar === pilarSlug)
    .sort((a, b) => (a.publicadoEm < b.publicadoEm ? 1 : -1));
}

export function getArtigo(pilarSlug: string, slug: string): Artigo | undefined {
  return artigos.find((a) => a.pilar === pilarSlug && a.slug === slug);
}
