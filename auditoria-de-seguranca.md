# Auditoria de segurança pré-lançamento — Run Again

Auditoria completa do repositório antes dos primeiros 50 usuários reais. Cada item da tarefa está listado abaixo com: o que encontrei, o que já corrigi no código, e — bem em destaque — o que precisa de uma ação sua fora do código (chave, configuração de painel).

**Nota sobre arquitetura, importante pra entender o resto do relatório:** a tarefa pede pra verificar "a fronteira Next.js ↔ Fastify". Não existe Fastify neste repositório — é um único app Next.js. Toda a lógica de servidor (o que a tarefa chama de "Fastify") vive em **Server Actions** (`"use server"`, ex.: `lib/leads/actions.ts`) e **Route Handlers** (`app/api/*/route.ts`), que rodam exclusivamente no servidor da Vercel, nunca no navegador — é a mesma fronteira de segurança que um servidor Fastify separado teria, só que dentro do mesmo processo Next.js. Onde a tarefa pede "confirme que X não acontece direto do navegador", verifiquei exatamente isso, só que contra este desenho real.

---

## 1. Segredos e variáveis de ambiente — ✅ JÁ CORRETO (nada pra corrigir)

**Verificado:**
- `.env.local` está no `.gitignore` (padrão `.env*`) e **nunca foi commitado** — vasculhei o histórico inteiro do git (`git log --all -p`), incluindo busca por padrões de chave real (JWT do Supabase, prefixos de chave da Anthropic/Resend) em todo commit já feito neste repositório. Nada encontrado.
- `.env.example` já existe, só com nomes de variável, sem nenhum valor real — nada precisou ser criado.
- A service role key do Supabase (`SUPABASE_SERVICE_ROLE_KEY`) só é usada em `lib/supabase/admin.ts`, que carrega `import "server-only"` no topo — isso faz o **build quebrar** se algum dia alguém tentar importar esse arquivo de um componente que roda no navegador. Conferi os 5 lugares que usam essa função: todos são Server Component ou Route Handler, nenhum Client Component.
- Toda variável com prefixo `NEXT_PUBLIC_` (visível no navegador) é realmente pública por natureza: URL do Supabase, chave anônima do Supabase (protegida por RLS, item 2) e a URL do site. Nenhum segredo real carrega esse prefixo.

**Classificação:** não se aplica (nada encontrado errado) — item já estava correto.

**Ação sua:** nenhuma.

---

## 2. Banco de dados (Supabase/Postgres)

### RLS habilitado em toda tabela — ✅ JÁ CORRETO
Contei as 24 tabelas em `public` criadas nas migrations e as 24 chamadas de `enable row level security` — batem 1 a 1, sem exceção. Isso inclui `lista_fundadoras` (captura de e-mail), que a tarefa pediu pra checar especificamente.

### Toda tabela com RLS tem pelo menos uma policy (ou é deliberadamente só-servidor) — ✅ JÁ CORRETO, com uma ressalva corrigida
3 tabelas têm RLS ligado sem nenhuma policy pro navegador: `audit_log`, `convites_beta` e `convites_profissional`. Isso **não é o bug que a tarefa descreve** ("RLS ligado sem policy quebra a função") — é uma decisão deliberada e documentada no próprio código: essas 3 tabelas só são escritas pela service role key (que ignora RLS), nunca pelo navegador. Confirmei rastreando cada escrita nessas tabelas no código — todas passam por `createAdminClient()`.

**Porém, encontrei um jeito real de contornar isso — CRÍTICO:** as funções que gravam nessas tabelas (`consumir_convite_beta`, `liberar_convite_beta`, `consumir_convite_profissional`) rodam com um privilégio especial do Postgres ("security definer") que ignora RLS. Isso é intencional — mas o Postgres libera essas funções pra **qualquer um chamar por padrão**, e ninguém tinha revogado esse acesso (ao contrário de 5 outras funções parecidas no projeto, que já tinham essa trava). Na prática, **qualquer pessoa na internet, usando só a chave pública do Supabase (a mesma que todo navegador já carrega), conseguia chamar a função de consumir código de convite direto contra o Supabase** — sem passar pelo site, sem nenhum limite de tentativas. Cada tentativa bem-sucedida consumia de verdade uma vaga de convite real. Escrevi uma primeira correção pra isso (`0012_endurecer_funcoes_convite.sql`).

**Atualização, depois de você aplicar a 0012 — encontrei que minha primeira correção não funcionou de verdade, e escrevi uma segunda pra consertar isso.** Testei direto contra o banco real (chamando a função exatamente como um invasor chamaria, usando só a chave pública) depois de você ter aplicado a 0012, e a chamada continuou funcionando normalmente — a correção não bloqueou nada. Causa: neste projeto Supabase, o papel "anônimo" (quem não fez login) recebe permissão pra chamar toda função nova de um jeito que um `revoke ... from public` não desfaz — precisa revogar explicitamente do papel anônimo e do papel autenticado, não só de "public". Esse mesmo erro já existia nas outras 5 funções "já protegidas" do projeto antes desta auditoria (achei testando uma por uma) — nelas não tem risco prático hoje porque cada uma confere por dentro se quem está chamando é o dono do dado, e isso continua funcionando; mas nas 3 funções de convite não existe essa segunda checada, então a falha ficava sem nenhuma proteção de verdade. Corrigido nas 8 de uma vez em `0014_corrigir_revoke_funcoes_definer.sql`, com o jeito certo de revogar (do papel anônimo e do autenticado, não só de "public"). **Ainda não tive como confirmar que este SQL específico bloqueia de verdade** — só vou saber com certeza depois que você aplicar esta migration e eu testar de novo contra o banco real, do mesmo jeito que testei a 0012 (é assim que descobri que a primeira correção não tinha funcionado). Me avisa depois de aplicar que eu confirmo.

**Classificação: CRÍTICO — corrigido no código, aguardando você aplicar mais uma migration (0014) pra valer de verdade.**

### Nenhuma policy deixa um usuário ler/editar dado de outro — ✅ JÁ CORRETO
Revisei as 63 policies do projeto. Todo `insert`/`update`/`delete` voltado ao corredor exige `usuario_id = auth.uid()` (ou equivalente) — testei isso especificamente com um script, e as únicas 3 policies de **leitura** sem essa trava são as do feed da Comunidade (posts/respostas/reações), que são uma lista compartilhada por desenho — qualquer corredor pode ver o post de outro, é a funcionalidade. Escrita nesses mesmos posts continua travada ao próprio autor.

Um ponto pra você saber, não um bug: **qualquer profissional pode ler o diagnóstico inicial e os check-ins de psicologia de qualquer corredor**, não só dos pacientes que ele atende. Isso está documentado no próprio código como decisão consciente do beta ("o beta não modela vínculo profissional↔especialidade↔paciente") — dado o tamanho da equipe (poucos profissionais contratados diretamente, não uma rede aberta), o projeto optou por simplificar isso por enquanto. Não mudei essa regra de negócio porque não foi pedido e mudar isso é uma decisão de produto, não uma correção de bug — só deixo registrado aqui pra você decidir com conhecimento de causa se isso ainda faz sentido conforme a equipe cresce.

### Formulário da lista de fundadores gravava direto do navegador — CRÍTICO, corrigido
Não estava exatamente nas perguntas do item 2, mas apareceu junto: a tabela `lista_fundadoras` tinha uma policy `with check (true)` liberando **qualquer** insert vindo do navegador, sem nenhuma restrição. Isso por si só não é incomum pra formulário público — mas combinado com o item 4 (abaixo), decidi travar essa também, pelo mesmo motivo do convite de beta: sem essa trava, qualquer proteção que eu adicionasse no site (validação de e-mail, honeypot, limite de tentativas) seria só decoração, porque dava pra escrever direto no Supabase ignorando o site inteiro. Corrigido junto com o item 4.

**Ação sua (leia com atenção — isso precisa acontecer antes das correções funcionarem):**
**Atualizado:** você já aplicou `0006`, `0011`, `0012` e `0013` — testei direto contra o banco real e confirmei que `0006` (tabela existe), `0011` (colunas + bucket de foto existem) e `0013` (o insert direto não é mais aceito) funcionaram certinho. Só falta aplicar `0014_corrigir_revoke_funcoes_definer.sql` (a correção da correção, explicada acima) pra fechar de vez o buraco das funções de convite.

---

## 3. Fronteira Next.js ↔ servidor (o que a tarefa chama de "Fastify")

**Verificado:**
- Nenhuma chamada que precisa da service role key roda no navegador (item 1 já cobre isso).
- As 3 rotas de servidor (`app/api/*/route.ts`) validam todo campo de entrada com Zod antes de fazer qualquer leitura/escrita — nenhuma confia direto num campo vindo do cliente.
- `app/api/encerrar-sessoes/route.ts` checa se existe uma sessão válida (`supabase.auth.getUser()`) **antes** de fazer a operação sensível, devolvendo 401 se não tiver.
- `app/api/cadastro-corredor/route.ts` e `app/api/aceitar-convite-profissional/route.ts` validam o código/token de convite no servidor via uma função do banco, nunca confiando em "o navegador disse que o código é válido".

**Classificação:** já estava correto — nenhuma correção necessária aqui além do que já está no item 4 (limite de tentativas).

**Ação sua:** nenhuma.

---

## 4. Formulários públicos (sem login)

### Lista de fundadores (captura de e-mail) — CRÍTICO, corrigido
Encontrei: o formulário gravava **direto do navegador** na tabela do Supabase (`components/marketing/ListaFundadorasForm.tsx` chamando `supabase.from("lista_fundadoras").upsert(...)` direto). A validação de e-mail existia, mas só no navegador (React) — qualquer requisição direta ao Supabase (contornando o site) passava batido, sem limite de tentativas, sem proteção de bot nenhuma.

Corrigido:
- Criei `lib/leads/actions.ts` (Server Action) que agora é o único caminho de escrita, usando a mesma validação de e-mail que já existia (`lib/leads/validation.ts`), só que rodando no servidor de verdade.
- Adicionei um campo honeypot invisível (`lib/security/rate-limit.ts` + o campo `website` no formulário) — invisível e inalcançável por teclado pra quem é gente de verdade; bot que preenche todo campo cai nessa armadilha, e o pedido é silenciosamente ignorado (finge sucesso, nunca avisa o bot que foi pego).
- Adicionei limite de 5 tentativas a cada 10 minutos por IP.
- Travei a tabela pra só aceitar escrita da service role key (migration `0013`, ver item 2) — sem isso, as 3 proteções acima seriam só decoração, contornáveis direto no Supabase.

### Código de convite de beta — CRÍTICO, corrigido
Já era validado no servidor (nunca só no navegador) — isso já estava certo. Mas **não existia limite de tentativas**: um script podia tentar centenas de códigos em sequência contra `/api/cadastro-corredor` sem nenhum bloqueio. Adicionei limite de 8 tentativas a cada 15 minutos por IP nessa rota, e na de convite de profissional também (risco bem menor ali, o token é um UUID praticamente impossível de adivinhar, mas mantive a mesma proteção por consistência).

### Mensagens de erro genéricas — ✅ JÁ CORRETO
Toda mensagem de erro mostrada ao usuário (nas 3 rotas de API e em todas as Server Actions que revisei) já usa texto genérico ("Isso não devia ter acontecido. Tenta de novo em alguns segundos.") — nunca stack trace, nome de tabela ou mensagem crua do banco. `lib/auth/erros.ts` já traduzia até os erros específicos do login pra linguagem de marca, sem vazar detalhe técnico. A tela de erro global (`app/error.tsx`) também só mostra um estado genérico, nunca `error.message`.

**Classificação: CRÍTICO — corrigido (formulário de e-mail e força bruta de convite).**

**Ação sua:** já feita — 0006 e 0013 aplicadas e confirmadas (ver item 2). A pendência que resta (migration 0014) é sobre o convite de beta, não sobre este formulário.

---

## 5. Cabeçalhos de segurança e transporte — corrigido (nada existia antes)

**Encontrado:** `next.config.ts` não tinha nenhum cabeçalho de segurança configurado. Nenhum link com `http://` hardcoded em lugar nenhum do código (a Vercel já força https em domínio próprio).

**Corrigido**, adicionei em `next.config.ts`:
- `Strict-Transport-Security` (força https por 2 anos, incluindo subdomínios)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (mais `frame-ancestors 'none'` na CSP, redundante de propósito pra navegador antigo)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` desligando câmera/microfone/geolocalização (o produto não usa nenhum dos três)
- Uma `Content-Security-Policy` levantada a partir do código de verdade (não um chute): o único domínio externo que o site usa é o do Supabase (dados, autenticação, e o bucket de fotos de perfil) — as fontes (Bebas Neue, Inter) usam `next/font/google`, que baixa e serve os arquivos pelo próprio domínio do site, sem nenhuma requisição ao Google em tempo de execução. Não existe nenhum script de analytics, embed ou de terceiro em nenhuma página.

**Por que a CSP está em modo "Report-Only" (não bloqueando ainda), como a tarefa pediu pra fazer quando não tiver certeza absoluta:** o próprio Next.js injeta pequenos scripts inline pra "religar" a página depois do carregamento (é assim que o framework funciona) — minha política já libera isso (`'unsafe-inline'`), e testei navegando por várias páginas (home, login, materiais, Run Explica) com o navegador aberto: **nenhum aviso de bloqueio apareceu no console em nenhuma delas.** Ainda assim, não naveguei o site inteiro manualmente meses a fio, então prefiro a versão mais segura de entregar isto: em modo aviso primeiro.

**Ação sua:** depois de navegar você mesma pelo site publicado (ou me pedir pra continuar testando), se não aparecer nenhum aviso de "Refused to..." no console do navegador (F12 → aba Console), o passo final é trocar, em `next.config.ts`, o nome do cabeçalho de `Content-Security-Policy-Report-Only` para `Content-Security-Policy` (remover só o `-Report-Only` do nome) — isso é uma linha de código, mas decidi não fazer essa troca sozinho porque é a única mudança desta auditoria que pode, em tese, quebrar alguma coisa visível pra quem usa o site, e a tarefa pediu explicitamente pra eu avisar em vez de arriscar.

**Classificação: IMPORTANTE — corrigido, com o passo final (ativar de vez a CSP) aguardando sua confirmação.**

---

## 6. CORS — ✅ JÁ CORRETO (nada pra corrigir)

**Verificado:** nenhuma rota do projeto define cabeçalho de CORS (`Access-Control-Allow-Origin`) — nem `*`, nem nada. Isso é o comportamento seguro por padrão do Next.js: sem esse cabeçalho, o navegador já bloqueia sozinho qualquer site de terceiro de ler a resposta dessas rotas. Adicionar uma configuração de CORS manual aqui seria abrir uma porta que hoje não existe, não fechar uma — por isso não mudei nada.

**Classificação:** não se aplica — item já estava correto.

**Ação sua:** nenhuma.

---

## 7. Dependências

- `npm audit`: **0 vulnerabilidades encontradas.** Nada pra corrigir — não rodei `npm audit fix` porque não havia nada pra ele fazer.
- Dependabot: **não existia nenhuma configuração.** Criei `.github/dependabot.yml`, checando semanalmente o ecossistema npm.

**Classificação: MENOR (nada crítico hoje, mas fecha uma lacuna de monitoramento futuro).**

**Ação sua:** o arquivo sozinho não liga o Dependabot — no GitHub, vá em **Settings → Code security and analysis** (dentro do repositório) e confirme que "Dependabot alerts" e "Dependabot security updates" estão ativados. Isso não dá pra fazer só editando código.

---

## 8. Rotas e telas administrativas — ✅ JÁ CORRETO (nada pra corrigir)

**Verificado:** não existe nenhuma rota `/admin` ou parecida em `app/`. O único script de "convite de profissional" (`scripts/criar-convite-profissional.mjs`) é um script de linha de comando, rodado manualmente no computador de quem tem acesso ao `.env.local` — nunca é publicado como página nem rota do site (a Vercel só publica o que está em `app/`, nunca a pasta `scripts/`). O acesso a `/profissional/*` já é bloqueado no nível de middleware pra quem não tem papel de profissional — testei essa lógica e ela redireciona corretamente.

**Classificação:** não se aplica — item já estava correto.

**Ação sua:** nenhuma.

---

## 9. Uploads e conteúdo enviado por usuário

**Encontrado:** existe um upload — a foto de perfil do corredor (`components/perfil/EditarPerfilForm.tsx` → `lib/auth/actions.ts`). É o único upload de arquivo em todo o produto.

**Verificado:** o tipo (só JPG/PNG/WEBP) e o tamanho (até 5MB) já são validados dentro de uma Server Action — ou seja, no servidor de verdade, não só no formulário do navegador. Já estava correto, não precisou de correção.

**Nota pra você (não é uma correção, é uma observação honesta):** essa validação confia no tipo de arquivo que o próprio navegador informa junto do upload — em teoria, alguém usando uma ferramenta técnica (não o site normal) poderia forjar esse campo. O `X-Content-Type-Options: nosniff` que adicionei no item 5 já reduz bastante esse risco (o navegador para de tentar "adivinhar" o conteúdo do arquivo pelo que está dentro dele). Uma camada extra (conferir os primeiros bytes do arquivo, não só o nome do tipo que ele diz ser) é possível no futuro, mas é mais sofisticada do que o pedido desta tarefa e o risco de hoje (só corredor já logado consegue enviar, pra uma pasta exclusiva dele) não pede isso agora.

**Classificação:** não se aplica — item já estava correto.

**Ação sua:** nenhuma agora; considerar a camada extra mencionada acima só se o produto crescer e uploads deixarem de ser só entre usuários já autenticados e de confiança relativa (ex.: se um dia qualquer visitante sem login puder enviar arquivo).

---

## Resumo — o que precisa da sua ação, fora do código

1. ~~Aplicar as migrations `0006`, `0011`, `0012`, `0013`~~ — feito, confirmado por mim contra o banco real. **Falta aplicar mais uma: `0014_corrigir_revoke_funcoes_definer.sql`** — descobri, testando a 0012 já aplicada, que ela não tinha bloqueado nada de verdade (explicado no item 2 acima); a 0014 é a correção de verdade. Cole o conteúdo dela no SQL Editor do Supabase, igual fez com as outras.
2. **Depois de navegar pelo site em produção e confirmar que não aparece nenhum aviso de bloqueio no console do navegador**, trocar `Content-Security-Policy-Report-Only` por `Content-Security-Policy` em `next.config.ts` (ou me pedir pra fazer essa troca depois de você confirmar).
3. **Ativar o Dependabot** nas configurações do repositório no GitHub (Settings → Code security and analysis).
4. Nenhuma chave precisa ser trocada — não encontrei nenhum segredo exposto em lugar nenhum, nem no código atual, nem no histórico do git.

## Resumo por severidade

| Severidade | Item | Status |
|---|---|---|
| CRÍTICO | Funções de convite chamáveis direto pela chave pública (item 2) | 1ª correção (0012) aplicada mas não funcionou de verdade — 2ª correção (0014) escrita, ainda precisa ser aplicada e confirmada |
| CRÍTICO | Formulário de e-mail gravava direto do navegador, sem validação/limite/honeypot reais (item 4) | Corrigido e confirmado — migration 0013 aplicada, testei e o insert direto já não é mais aceito |
| CRÍTICO | Força bruta de código de convite de beta sem limite de tentativas (item 4) | Corrigido no código (não depende de migration) |
| IMPORTANTE | Nenhum cabeçalho de segurança/CSP existia (item 5) | Corrigido — CSP em modo aviso, aguardando sua confirmação pra ativar de vez |
| MENOR | Dependabot não estava configurado (item 7) | Arquivo criado — precisa ativar no GitHub |
| — | Itens 1, 3, 6, 8, 9 e a maior parte do item 2 | Já estavam corretos, nada precisou mudar |
