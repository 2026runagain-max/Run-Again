# Reestruturação final de navegação

Relatório da tarefa "Reestruturação final de navegação: o blog vira a home de quem não está logado, e nenhuma página fica órfã".

## O que mudou

1. **`/` agora mostra o conteúdo que antes vivia em `/blog`** (`app/(publico)/page.tsx` recebeu as seções "Destaques" e "Navegue por pilar" do blog, mantendo toda a copy da antiga home — lista de fundadores incluída, sem parafrasear nem apagar nenhuma frase). `/blog` virou um redirecionamento pra `/` (`redirect("/")`, mesmo padrão já usado por `/area-de-membro` → `/login`) — link antigo compartilhado continua funcionando.
2. **Header deslogado**, na ordem exata pedida: logo (→ `/`) · Run Explica · Método · Sobre · Run Again Materiais (dropdown) · Entrar. "Blog" saiu de `lib/nav-config.ts` (a logo já cobre esse destino).
3. **Header/menu do corredor logado**: `navCorredor` já tinha Treinos Recomendados, Nutrição, Psicologia, Comunidade e Perfil (entregues em tarefas anteriores) — confirmado que continuam lá. "Run Again Materiais" aparece pro corredor logado porque o dropdown é renderizado no `Header` sem condicionar à área.
4. **Rodapé definitivo** (`components/layout/Footer.tsx`, usado nas 3 áreas — pública, corredor, profissional): adicionado "Método" (faltava), "Run Again Materiais" (não existia) e uma linha de redes sociais — só "Instagram", com link placeholder `#` porque nenhuma conta social real foi informada (comentário no código avisa pra trocar antes do lançamento, mesmo padrão do link do Hotmart da tarefa anterior). "Blog" passou a apontar pra `/`.
5. Breadcrumbs de `/blog/[pilar]` e `/blog/[pilar]/[slug]` ("Blog" → agora aponta pra `/`).
6. `app/sitemap.ts`: removida a entrada solta de `/blog` (agora é redirecionamento, não deve ir no sitemap); `/` herda a prioridade mais alta; adicionadas `/materiais` e as 3 páginas-placeholder.

## Tabela de mapeamento — confirmação

| Página | Antes (o problema) | Depois (o que essa tarefa precisa garantir) | Confirmado |
|---|---|---|---|
| Home (lista de fundadores) | Era a home isolada | Vira seção/CTA dentro da nova home (blog) | **Sim** — toda a copy da home (hero, quem somos, 5 pilares, benefícios, provas, oferta/captura, compromisso, FAQ, urgência, CTA final) está em `app/(publico)/page.tsx`, entremeada com as seções do blog. |
| Blog | Só alcançável de dentro da home ou do rodapé, dependendo da versão | Agora É a home deslogada | **Sim** — `/` mostra o conteúdo do blog (Destaques + Navegue por pilar); `/blog` redireciona pra `/` (testado: `curl /blog` → 307). |
| Run Explica | Só citado dentro de posts do blog | Item fixo do header, deslogado e logado | **Sim** — já estava em `navPublico` (tarefa anterior de terminologia) e em `navCorredor`/rodapé; confirmado presente nas duas versões testando no navegador. |
| Comunidade / Nutrição / Psicologia / Treinos Recomendados | Dependia de navegação profunda dentro do painel | Cada um com entrada própria e visível no menu do painel | **Sim** — as 4 já estavam em `navCorredor` de tarefas anteriores; testado no navegador logado, todas acessíveis por um clique no header. |
| Conteúdo aberto (blog/Explica/Método/Sobre) a partir de dentro do painel | Não existia caminho sem deslogar | Link visível no menu ou rodapé da área logada | **Sim** — rodapé do painel (mesmo `Footer` de todas as áreas) tem Blog(→`/`), Run Explica, Método e Sobre; testado no navegador: naveguei de `/corredor/perfil` pra `/` logado, sessão manteve (avatar continuou visível). |
| Edição de perfil | Não existia | Entrada própria no menu do painel | **Sim** — "Perfil" em `navCorredor` → `/corredor/perfil`, que já tem o formulário de edição (tarefa anterior). |
| Registro de refeição/treino | Existia, mas enterrado | Já tem botão de destaque (tarefa anterior) — confirme que também está no menu | **Sim** — os botões "Registrar treino"/"Registrar refeição" continuam no painel; o caminho de menu (Treinos Recomendados / Nutrição, ambos em `navCorredor`) também chega às mesmas telas. |
| Run Again Materiais | Não existia | Botão no header (deslogado e logado) + rodapé | **Sim** — dropdown no header (`MateriaisDropdown`, sem condicionar à área — aparece deslogado, corredor e profissional) + link "Run Again Materiais" no rodapé → `/materiais`. |

## Todo endereço do site com pelo menos um caminho de menu

Testado clicando (não só lido no código) — deslogado, logado como corredor, e o conteúdo do menu mobile verificado via DOM (ver nota sobre viewport abaixo).

**Público (deslogado), via header/rodapé:**
- `/` — logo do header (home = blog)
- `/explica` e `/explica/[termo]` — "Run Explica" no header → lista de termos → cada termo
- `/metodo` — "Método" no header
- `/sobre` — "Sobre" no header
- `/materiais` — "Run Again Materiais" no rodapé (a própria vitrine)
- `/materiais/ebook-2`, `/materiais/curso-1`, `/materiais/curso-2` — dropdown "Run Again Materiais" no header + cards da vitrine
- `/ebook-corrida-sem-lesao` — dropdown "Run Again Materiais" no header + vitrine + rodapé
- `/blog/[pilar]` (5 categorias) — seção "Navegue por pilar" da home
- `/blog/[pilar]/[slug]` (artigos) — seção "Destaques" da home (vazia hoje — zero artigos publicados ainda — mas o mecanismo está pronto) e a listagem de cada `/blog/[pilar]`
- `/login` — "Entrar" no header
- `/cadastro` — link "Criar conta" dentro de `/login`
- `/recuperar-senha` — link "Esqueci minha senha" dentro de `/login`
- `/contato`, `/termos`, `/privacidade` — rodapé
- `/area-de-membro` — rodapé (redireciona pra `/login`, mesmo padrão de sempre)

**Corredor logado, via header/rodapé:**
- `/corredor/painel` — "Início"
- `/corredor/minha-recuperacao` (+ `/sessao`, `/evolucao`, `/historico`) — "Treinos Recomendados" no header, mais os links internos do próprio hub
- `/corredor/nutricao` (+ `/avaliacao`, `/registro`, `/minha-orientacao`) — "Nutrição" no header, mais os links internos do hub e o botão de destaque do painel
- `/corredor/psicologia/check-in` — "Psicologia" no header
- `/corredor/comunidade` — "Comunidade" no header
- `/corredor/perfil` — "Perfil" no header
- `/corredor/comecar` — CTA "Começar minha avaliação" no painel, pra quem ainda não tem diagnóstico
- `/corredor/diagnostico` — resultado do questionário (chega lá ao concluir a avaliação em `/corredor/comecar`)
- `/`, `/explica`, `/metodo`, `/sobre`, `/materiais` (+ produtos) — rodapé do painel, sem precisar deslogar

**Fora do escopo desta tarefa (rotas de token/e-mail, sempre assim por desenho, não navegáveis por menu):** `/convite/[token]`, `/recuperar-senha/redefinir`. A área profissional (`navProfissional`) não foi alterada nesta tarefa — continua com Início, Pacientes, Nutrição, Psicologia, Perfil, e agora também herda o rodapé atualizado (Blog/Run Explica/Método/Sobre/Materiais), já que usa o mesmo componente `Footer`.

## Nota sobre teste em celular

O ambiente de teste não conseguiu redimensionar a janela do navegador de forma confiável pra simular viewport mobile (ferramenta de resize não teve efeito no viewport real renderizado). Como alternativa, confirmei o conteúdo do menu mobile diretamente: acionei o botão "Abrir menu" via JavaScript e inspecionei o painel resultante no DOM — confirmado que lista Run Explica, Método, Sobre, e "Run Again Materiais" seguido dos 4 produtos, exatamente como no menu desktop. A estrutura CSS (`md:hidden`/`md:flex`) que decide o que aparece em qual largura de tela não foi tocada nesta tarefa — só o conteúdo dentro dela.
