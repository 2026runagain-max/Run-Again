import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site/config";
import { pilaresBlog } from "@/lib/blog/pilares";
import { artigos } from "@/lib/blog/content";
import { termos } from "@/lib/explica/content";
import { materiais } from "@/lib/site/materiais";

// §8 do PRD "Site Aberto": sitemap.xml automático, incluindo toda rota nova
// do site aberto. Páginas de autenticação (/login, /cadastro, /convite,
// /recuperar-senha, /area-de-membro) ficam de fora de propósito — não são
// conteúdo indexável.
//
// Reestruturação de navegação (decisão de produto, 2026-09): "/blog" saiu
// desta lista — agora é só um redirecionamento pra "/" (o blog virou a
// home), e um sitemap não deve listar uma URL que redireciona. "/" herda a
// prioridade/frequência mais alta que "/blog" já tinha.
export default function sitemap(): MetadataRoute.Sitemap {
  const paginasEstaticas: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/metodo`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/explica`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/materiais`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/ebook-corrida-sem-lesao`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contato`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/termos`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/privacidade`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const paginasMaterial: MetadataRoute.Sitemap = materiais
    .filter((material) => material.placeholder)
    .map((material) => ({
      url: `${SITE_URL}${material.href}`,
      changeFrequency: "monthly",
      priority: 0.4,
    }));

  const paginasPilarBlog: MetadataRoute.Sitemap = pilaresBlog.map((pilar) => ({
    url: `${SITE_URL}/blog/${pilar.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const paginasArtigo: MetadataRoute.Sitemap = artigos.map((artigo) => ({
    url: `${SITE_URL}/blog/${artigo.pilar}/${artigo.slug}`,
    lastModified: artigo.publicadoEm,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const paginasTermo: MetadataRoute.Sitemap = termos.map((termo) => ({
    url: `${SITE_URL}/explica/${termo.slug}`,
    lastModified: termo.publicadoEm,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...paginasEstaticas, ...paginasMaterial, ...paginasPilarBlog, ...paginasArtigo, ...paginasTermo];
}
