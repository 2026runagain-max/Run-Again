export interface NavItem {
  label: string;
  href: string;
}

export const navCorredor: NavItem[] = [
  { label: "Início", href: "/corredor/painel" },
  { label: "Treinos Recomendados", href: "/corredor/minha-recuperacao" },
  { label: "Nutrição", href: "/corredor/nutricao" },
  { label: "Psicologia", href: "/corredor/psicologia/check-in" },
  { label: "Comunidade", href: "/corredor/comunidade" },
  { label: "Perfil", href: "/corredor/perfil" },
];

export const navProfissional: NavItem[] = [
  { label: "Início", href: "/profissional/painel" },
  { label: "Pacientes", href: "/profissional/pacientes" },
  { label: "Nutrição", href: "/profissional/nutricao/casos" },
  { label: "Psicologia", href: "/profissional/psicologia/fila" },
  { label: "Perfil", href: "/profissional/perfil" },
];

// §4 do PRD "Site Aberto" — navegação do header público (deslogado), à
// esquerda dos CTAs de conversão.
//
// Reestruturação de navegação (decisão de produto, 2026-09): "Blog" saiu
// desta lista porque o blog virou a própria home (/) — a logo do header já
// linka pra lá, repetir como item de nav ao lado seria redundante. Ordem
// dos itens restantes é a definida pela tarefa: Run Explica · Método ·
// Sobre (Run Again Materiais e Entrar são renderizados à parte no Header).
export const navPublico: NavItem[] = [
  { label: "Run Explica", href: "/explica" },
  { label: "Método", href: "/metodo" },
  { label: "Sobre", href: "/sobre" },
];

export function navPorArea(area: "publico" | "corredor" | "profissional"): NavItem[] {
  if (area === "corredor") return navCorredor;
  if (area === "profissional") return navProfissional;
  return navPublico;
}

// RF07-CA1 (lib/supabase/middleware.ts) — enquanto o corredor não tem
// persona definida, toda rota de /corredor/* redireciona pra
// /corredor/comecar, exceto estas duas. Fonte única: o Header (QA do beta)
// e o middleware precisavam da mesma lista pra não ficarem inconsistentes
// — um nav que mostra um link que o middleware bloqueia é exatamente o
// "ponto sem saída" que a Returnista não deveria encontrar.
export const ROTAS_CORREDOR_SEM_PERSONA = ["/corredor/comecar", "/corredor/perfil"];
