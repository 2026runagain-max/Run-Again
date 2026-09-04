// URL canônica do site aberto — usada em metadataBase (app/layout.tsx),
// sitemap.ts e nos dados estruturados (JSON-LD) das páginas de venda.
// Fonte: PRD "Arquitetura de Produto — Site Aberto", §8.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://runagain.com.br";
