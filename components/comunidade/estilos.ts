// Hierarquia de CTA da Comunidade — 4 níveis, sempre pelos mesmos
// componentes/classes, nunca inventados caso a caso (auditoria de design,
// 2026-09):
//   1. Button variant="primary"    — compromisso maior: publicar um tópico,
//                                    concluir o onboarding.
//   2. Button variant="fire-ghost" — compromisso leve: responder a um
//                                    tópico já aberto.
//   3. Link em texto (text-fire-text, font-semibold, sem sublinhado até
//      hover) — navegação ou convite secundário: "Ver sessão de hoje →",
//      "Compartilhar isso com o grupo", abrir o formulário de resposta.
//   4. CLASSE_LINK_DISCRETO (abaixo) — ação rara ou sensível: excluir,
//      reportar. Nunca no mesmo peso visual do nível 3, pra não competir
//      com a ação que a Returnista veio fazer na tela.
//
// Classe compartilhada pra transformar o Button dentro de ConfirmActionButton
// num link discreto (mesmo peso visual de ReportarConteudoButton) — as
// ações de excluir post/tópico/resposta nunca competem visualmente com o
// CTA principal da tela.
export const CLASSE_LINK_DISCRETO =
  "h-auto rounded-none border-0 bg-transparent px-0 py-0 text-xs font-sans font-normal normal-case tracking-normal text-mid underline decoration-mid/40 underline-offset-2 hover:bg-transparent hover:text-ink";
