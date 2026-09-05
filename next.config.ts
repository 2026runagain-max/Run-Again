import type { NextConfig } from "next";

// Auditoria de segurança pré-lançamento (2026-09), item 5 — cabeçalhos de
// segurança e transporte. Nenhum existia antes desta auditoria.
//
// Domínios externos que o site realmente usa, levantados varrendo o
// código (não um chute): só o projeto Supabase (*.supabase.co — dados,
// autenticação, e o bucket de fotos de perfil). As fontes (Bebas Neue,
// Inter) usam next/font/google, que baixa e serve os arquivos pelo
// próprio domínio do site em build time — não existe requisição em tempo
// de execução pra fonts.googleapis.com/fonts.gstatic.com, então a CSP não
// precisa liberar esses domínios. Nenhum analytics, embed ou script de
// terceiro foi encontrado em nenhuma página.
const SUPABASE_ORIGIN_WILDCARD = "https://*.supabase.co";

// script-src/style-src precisam de 'unsafe-inline' porque o próprio
// Next.js App Router injeta scripts inline pra hidratar a página (os
// blocos "self.__next_f.push(...)") e Tailwind/React usam estilo inline em
// alguns pontos — sem isso, a hidratação quebra em toda página. Uma CSP
// baseada em nonce seria mais forte, mas exige gerar um nonce por
// requisição no middleware e propagá-lo — infraestrutura nova que esta
// tarefa pede pra evitar quando a correção mais simples já resolve o
// problema real (scripts/estilos de terceiro não previstos).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: ${SUPABASE_ORIGIN_WILDCARD}`,
  "font-src 'self'",
  `connect-src 'self' ${SUPABASE_ORIGIN_WILDCARD} wss://*.supabase.co`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // HTTPS forçado por 2 anos, incluindo subdomínios — a Vercel já
          // redireciona http para https em domínio próprio, mas o cabeçalho
          // em si (que instrui o NAVEGADOR a nunca tentar http de novo,
          // mesmo num link antigo) precisa ser setado pela aplicação.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Impede o navegador de "adivinhar" o tipo de um arquivo servido
          // (ex.: tratar um upload como script executável).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Nenhuma página deste site pode ser carregada dentro de um
          // <iframe> de outro site (proteção contra clickjacking) — mesma
          // regra que frame-ancestors 'none' na CSP abaixo, duplicada aqui
          // pra navegador antigo que não entende CSP.
          { key: "X-Frame-Options", value: "DENY" },
          // Nunca vaza a URL completa (que pode ter e-mail/token em query
          // string) pra um site de terceiro num link de saída.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // O produto não usa câmera, microfone nem geolocalização —
          // desliga os três de propósito.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Report-Only de propósito nesta primeira versão (não bloqueia
          // nada ainda, só registra no console do navegador o que violaria
          // a regra) — troque pra "Content-Security-Policy" (sem o
          // "-Report-Only") depois de confirmar, navegando pelo site em
          // produção, que nenhum aviso aparece no console. Ver
          // auditoria-de-seguranca.md para o passo a passo.
          { key: "Content-Security-Policy-Report-Only", value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
