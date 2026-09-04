import { redirect } from "next/navigation";

// §13.4 do PRD "Site Aberto": /area-de-membro nunca ganha uma segunda tela
// de login — é sempre um alias de /login, que já existe e funciona
// (Fluxo 1). Sem metadata própria: quem chega aqui nunca fica na página.
export default function AreaDeMembroPage() {
  redirect("/login");
}
