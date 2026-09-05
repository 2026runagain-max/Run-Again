import { redirect } from "next/navigation";

// Reestruturação de navegação (decisão de produto, 2026-09): o blog vira a
// home de quem não está logado — o conteúdo que vivia aqui mudou pra
// app/(publico)/page.tsx. /blog continua existindo só como redirecionamento,
// pra não quebrar link já compartilhado (mesmo padrão de /area-de-membro
// como alias de /login).
export default function BlogRedirect() {
  redirect("/");
}
