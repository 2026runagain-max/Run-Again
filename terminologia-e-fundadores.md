# Terminologia (Preparo Físico) e reconciliação da lista de fundadores

Relatório da tarefa "Terminologia (Preparo Físico) e reconciliação da lista de fundadores". Duas decisões independentes, aplicadas na mesma branch por serem as duas varreduras de copy/lógica sem mudança de estrutura de página ou menu.

---

## Grupo 1 — Preparo Físico e Fisioterapia são a mesma entrega

Nada de estrutura mudou: os mesmos 5 pilares continuam existindo em `lib/site/pilares-produto.ts` (`fisioterapia`, `preparacao-fisica`, `nutricao-esportiva`, `psicologia-do-esporte`, `comunidade`), e o enum `especialidade_profissional` no banco continua com `fisioterapia` e `educacao_fisica` como valores distintos — **só a palavra exibida ao corredor mudou**. Escolhi **"Treino"** (não "Preparo Físico") como o novo nome público do pilar que já existia com o slug `fisioterapia`, porque o produto **já tinha** um pilar público chamado "Preparação Física" (slug `preparacao-fisica`, especialidade `educacao_fisica`) — usar "Preparo Físico" para os dois criaria uma confusão nova (dois cards com nome quase idêntico), exatamente o problema que esta tarefa pede pra resolver.

`fisioterapia`/`fisioterapeuta` continuam existindo como termo técnico interno: campo de especialidade do profissional (cadastro, `/convite/[token]`, `/profissional/perfil`), prontuário clínico (`app/profissional/pacientes/[id]/*`), nomes de arquivo/pasta (`lib/fisioterapia/*`, `components/fisioterapia/*`) e slugs de URL (nunca trocados, por instrução explícita de não mudar estrutura).

### (a) Ocorrências de "Fisioterapia" trocadas — antes → depois

| Arquivo | Antes | Depois |
|---|---|---|
| `lib/site/pilares-produto.ts` | `nome: "Fisioterapia"` (pilar, slug `fisioterapia`) | `nome: "Treino"` |
| `lib/site/pilares-produto.ts` (descrição do pilar Nutrição) | "...sustenta o treino e a recuperação, coordenado com o que **a fisioterapia** e a preparação física já sabem..." | "...sustenta sua evolução, coordenado com o que **os pilares de Treino** e Preparação Física já sabem..." |
| `lib/blog/pilares.ts` | `nome: "Fisioterapia e Retorno ao Esporte"` (slug inalterado: `fisioterapia-e-retorno-ao-esporte`) | `nome: "Treino e Retorno ao Esporte"` |
| `app/layout.tsx` (metadata raiz) | "**Fisioterapia**, preparo físico e ecossistema clínico em um só lugar." | "**Treino**, preparo físico e ecossistema clínico em um só lugar." |
| `app/(publico)/page.tsx` (metadata) | "O primeiro ecossistema que junta **fisioterapia, preparação física**, nutrição e psicologia do esporte..." | "O primeiro ecossistema que junta **treino**, nutrição e psicologia do esporte..." |
| `app/(publico)/page.tsx` (hero) | mesma frase acima, no corpo do hero | mesma correção |
| `app/(publico)/page.tsx` (benefícios) | "Você tem **fisioterapia, preparo físico**, nutrição e psicologia do esporte no mesmo lugar..." | "Você tem **treino**, nutrição e psicologia do esporte no mesmo lugar..." |
| `app/(publico)/page.tsx` (FAQ "Isso é só mais um app de treino?") | "...o Run Again junta **fisioterapia, preparo físico**, nutrição e psicologia do esporte..." | "...o Run Again junta **treino**, nutrição e psicologia do esporte..." |
| `app/(publico)/page.tsx` (seção "A solução") | "Nenhum concorrente integra **fisioterapia, preparação física**, nutrição e psicologia do esporte..." | "Nenhum concorrente integra **treino**, nutrição e psicologia do esporte..." |
| `app/(publico)/metodo/page.tsx` (metadata) | "...explicados em profundidade: **fisioterapia**, preparação física, nutrição esportiva..." | "...explicados em profundidade: **treino**, preparação física, nutrição esportiva..." |
| `app/(publico)/metodo/page.tsx` (hero) | "Nenhum concorrente integra **fisioterapia**, preparação física, nutrição..." | "Nenhum concorrente integra **treino**, preparação física, nutrição..." |
| `app/(publico)/explica/page.tsx` (metadata) | "Glossário de termos de **fisioterapia, preparo físico**, nutrição esportiva..." | "Glossário de termos de **treino**, nutrição esportiva..." |
| `app/(publico)/blog/page.tsx` (metadata) | "Artigos e guias sobre retorno ao esporte, **fisioterapia**, preparo físico..." | "Artigos e guias sobre retorno ao esporte, **treino**, preparo físico..." |
| `app/(publico)/blog/page.tsx` (hero) | "**Fisioterapia**, preparo físico, nutrição esportiva, **medicina** e psicologia do esporte..." | "**Treino**, preparo físico, nutrição esportiva e psicologia do esporte..." (bônus: "medicina" era resíduo da remoção do pilar Medicina do Esporte numa tarefa anterior — removido junto) |
| `app/(publico)/ebook-corrida-sem-lesao/page.tsx` (tópico do ebook) | "Onde **a fisioterapia** termina e o preparo físico começa — e por que os dois precisam se conversar." | "Por que **treino** e preparo físico não são fases separadas da sua volta — e como os dois andam juntos desde o primeiro dia." (a frase antiga contradizia a decisão de que são a mesma entrega — não era só trocar a palavra, precisava reescrever o sentido) |
| `app/(publico)/privacidade/page.tsx` | "...passa a valer a partir dos fluxos de **fisioterapia**, nutrição e demais pilares clínicos..." | "...passa a valer a partir dos fluxos de **treino**, nutrição e demais pilares clínicos..." |
| `components/painel/GradePilares.tsx` (card ativo do painel) | `<h3>Fisioterapia</h3>` | `<h3>Treino</h3>` |
| `app/corredor/painel/page.tsx` (badge do card, painel sem diagnóstico) | `<Badge>FISIOTERAPIA</Badge>` | `<Badge>TREINO</Badge>` |
| `lib/painel/copy.ts` (`OUTROS_PILARES`, lista "em construção" do painel) | `[{ nome: "Preparo físico" }]` | `[]` (ver nota abaixo) |

**Nota sobre `OUTROS_PILARES`:** o painel do corredor mostrava, ao mesmo tempo, um card **ativo** chamado "Fisioterapia" no topo e uma linha separada "Preparo físico · Em construção" mais abaixo — o mesmo problema de fundo que esta tarefa resolve, só que dentro do produto, não na home. Como as duas entregas agora são uma coisa só pro corredor (e a de cima já está ativa), removi a linha "Preparo físico · Em construção": mostrar as duas ao mesmo tempo (uma pronta, uma "chegando") contradiz a decisão na cara de quem está logado. O cadastro de especialidade `educacao_fisica` continua existindo no banco — só a lista pública desta tela que não repete a mesma entrega duas vezes. Confirmado visualmente: o painel de um corredor sem sessão prescrita agora mostra só "Treino" (ativo) + Nutrição/Psicologia ("em construção", condicionados a outros critérios), sem a linha duplicada.

### Ocorrências de "Fisioterapia" mantidas de propósito (termo técnico/credencial, não nome de produto)

- **Credencial do Gustavo** ("Gustavo é fisioterapeuta há 16 anos...", em `lib/site/fundadores.ts` e nas 2 menções "16 anos de fisioterapia clínica" na home e no ebook): descreve a formação/especialidade real de uma pessoa — exatamente a exceção que a própria tarefa cita ("campo de especialidade do profissional"). Trocar por "treino" soaria como se ele tivesse um diploma de "Treino", o que não existe.
- **Bio da Bruna** ("Fisioterapia que não conversava com o treino", em `lib/site/fundadores.ts`) e a frase da "cena de dor" da home ("da fisioterapia que tratou o sintoma e não a causa"): descrevem uma experiência real e externa ao Run Again (o serviço de fisioterapia que a pessoa já fez antes, fora do produto) — não é o nome do pilar do Run Again, é uma referência genérica a um serviço de saúde que existe no mundo real.
- **Opção do questionário de diagnóstico** ("Com acompanhamento de fisioterapia", em `lib/avaliacao/copy.ts`): pergunta como o corredor tratou uma lesão passada — mesma lógica acima, referência a um serviço real, não ao pilar.
- **`labelEspecialidade` (`lib/labels.ts`)**: usado só em `/convite/[token]` e `/profissional/perfil` — telas onde o próprio profissional vê a especialidade dele. Confirmei os dois únicos call-sites antes de decidir manter.
- **Prontuário e demais telas de `app/profissional/*`**: nunca tocadas, por instrução explícita da tarefa.
- **Bônus corrigido, fora do pedido original mas achado nesta varredura**: "mais de 25 anos de fisioterapia clínica" na home (`app/(publico)/page.tsx`, seção "Nosso compromisso") — resíduo de uma correção já aprovada numa tarefa anterior (Gustavo tem 16 anos, não 25) que sobreviveu à varredura por regex daquela vez. Corrigido para "16 anos" nesta passada, já que eu estava editando a mesma frase de qualquer forma.

### (b) Correção da palavra "recuperação"

A tarefa citava uma investigação anterior que teria listado ocorrências de "recuperação" descrevendo o pilar como reabilitação-apenas. Como esta é uma sessão nova sem acesso a essa lista literal, refiz a varredura completa por `recuperaç[aã]o` no projeto inteiro. Resultado: **6 arquivos** com correspondência —

- `lib/fisioterapia/copy.ts` — só comentário de código (já documenta a troca "Protocolo"/"recuperação" → "Treinos Recomendados" feita antes).
- `qa-e-growth-beta.md` — relatório histórico de uma tarefa anterior, não é copy ao vivo do produto.
- `lib/avaliacao/diagnostico.ts` (2 ocorrências) — "é a base da recuperação" e "conta... na sua recuperação", ambas sobre recuperação física genérica (sono, descanso) no diagnóstico inicial.
- `lib/nutricao/motor.ts` (2 ocorrências) e `lib/nutricao/guia-treino.ts` (1) e `lib/nutricao/copy.ts` (1) — todas "recuperação muscular"/"a recuperação" no sentido de ciência do esporte (o corpo recuperando depois do treino), terminologia universal de nutrição esportiva.

Nenhuma das ocorrências restantes descreve o pilar Treino/Fisioterapia como "só reabilitação de lesão" — todas usam "recuperação" no sentido fisiológico padrão (recuperação pós-treino), que não reforça o mito que a marca quer quebrar. **Nenhuma correção foi necessária além da renomeação já feita numa tarefa anterior** ("Minha Recuperação" → "Treinos Recomendados"). Confirma a conclusão da investigação original.

---

## Grupo 2 — A lista de fundadores não pode prometer vaga no beta

### (a) Frases que prometiam acesso ao beta — antes → depois

Todas em `components/marketing/ListaFundadorasForm.tsx` (usado por padrão em `/blog/[pilar]/[slug]`, `/explica`, `/explica/[termo]`) e em `app/(publico)/page.tsx` (home, que sobrescreve `ctaLabel`/textos em vários pontos):

| Local | Antes | Depois |
|---|---|---|
| `ListaFundadorasForm`, `ctaLabel` padrão | "Quero garantir **minha vaga** de fundador" | "Quero receber novidades do Run Again" |
| `ListaFundadorasForm`, `microtexto` padrão | "Grátis. Sem cartão. Você só perde **a vaga** se não entrar agora." | "Grátis. Sem cartão. Só pra receber novidades e conteúdo do Run Again por e-mail." |
| `ListaFundadorasForm`, mensagem de sucesso | "...e você é a primeira a saber quando **as vagas de acesso antecipado** abrirem." | "...e você passa a receber novidades e conteúdo do Run Again por lá." |
| Home, eyebrow do hero | "Lista de fundadores · **vagas limitadas** na fase atual" | "Lista de fundadores · novidades por e-mail" |
| Home, oferta (item removido) | "**Prioridade de acesso** quando o app abrir — você entra antes de quem chegar depois." | *(removido)* |
| Home, oferta (item removido) | "**Preço de fundador travado** — quando abrir pro público, a assinatura... Quem está na lista agora trava a condição mais baixa..." | *(removido)* |
| Home, oferta (item adicionado, neutro) | — | "Novidades do Run Again sempre que tiver algo real pra contar. Sem spam, sem promessa de vaga." |
| Home, título/eyebrow da seção de oferta | Eyebrow "Condição de fundador" / "O que você **garante** entrando pra lista agora" | Eyebrow "O que você recebe" / "O que você **recebe** entrando pra lista agora" |
| Home, FAQ "O que acontece depois que eu entro na lista?" | "...entra **no grupo de bastidores**, e é a primeira a saber quando **as vagas de acesso antecipado** abrirem." | "...e passa a receber os bastidores da construção do produto e as novidades do Run Again direto no seu e-mail." |
| Home, FAQ "Vou ser cobrada por entrar na lista?" | "...Você só decide se quer assinar quando o app estiver pronto — **com a condição de preço já travada**." | "...é só pra você receber novidades e conteúdo do Run Again por e-mail." |
| Home, CTA intermediário (título) | "...mas dá pra **garantir sua vaga** antes de todo mundo." | "...mas dá pra ficar por dentro de tudo antes de todo mundo." |
| Home, CTA intermediário (`ctaLabel`) | "**Garantir minha vaga** de fundador" | "Quero receber novidades do Run Again" |
| Home, linha "R$0 hoje" | "R$0 hoje. Sem cartão. Só **a sua vaga garantida** antes que a fase de fundadores feche." | "R$0 hoje. Sem cartão. Só pra receber novidades e conteúdo do Run Again por e-mail." |
| Home, seção "Urgência" | "...Isso significa que a fase de fundadores tem **vagas limitadas** de verdade." | "...A lista de fundadores não é fila de espera pro beta: é o jeito mais direto de saber, assim que tivermos novidade real pra contar." |
| Home, CTA final (`ctaLabel`) | "Quero **minha vaga** de fundador" | "Quero receber novidades do Run Again" |

O bônus do ebook (liberado assim que a pessoa entra na lista) **foi mantido** — é um mecanismo de isca de conteúdo (lead magnet) separado da promessa de acesso ao beta, e a tarefa não pediu pra mudar isso, só a linguagem de acesso/prioridade/vaga.

### Frases já neutras, confirmadas e mantidas sem alteração

- FAQ "Quando o app lança?": "Quem está na lista de fundadores é **avisado em primeira mão**..." — "avisado" é informação, não acesso.
- Seção "Nosso compromisso": "...é só garantir que, quando abrirmos, você seja uma das primeiras **a saber**." — mesma lógica, "saber" não é "entrar".
- Rodapé dos artigos de blog: "Sem cartão, sem checkout — só pra saber quando o Run Again abrir." — informacional.
- FAQ do ebook sobre preço/formato: não promete que a lista dá acesso ao beta, só explica o mecanismo do ebook-bônus.
- `/sobre`: "50 vagas e 90 dias de acesso gratuito..." — descreve o programa de beta real (não a lista de e-mail).
- `/cadastro`: eyebrow "50 VAGAS DE BETA" — describe o cadastro real de quem já tem convite (fluxo separado, não a lista).
- `/termos`: "convite de beta é gratuito por 90 dias..." — termos de quem já tem convite, não uma promessa nova à lista.

### (b) Ferramenta manual de convite de beta — confirmação

Investigado o fluxo completo de convite de beta no código:

- Existe a tabela `public.convites_beta` (`codigo`, `usos_maximos`, `usos_atuais`, `ativo`, `criado_em`), criada em `supabase/migrations/0001_fundacao.sql`, consumida via as funções `consumir_convite_beta`/`liberar_convite_beta` (chamadas por `app/api/cadastro-corredor/route.ts` quando alguém se cadastra com um código). **Não há política de RLS que permita o client ler ou escrever essa tabela** — só acesso via service role.
- Existe **um** script de convite manual no repo: `scripts/criar-convite-profissional.mjs` — mas ele grava na tabela `convites_profissional` (convite de **profissional**, com token e e-mail), uma tabela e um fluxo completamente diferentes do convite de beta do corredor.
- **Não existe** um script equivalente, nem qualquer painel/tela de administração, para criar um código em `convites_beta`. A única forma de gerar um convite de beta hoje é um INSERT SQL direto nessa tabela pelo editor SQL do Supabase — não é uma ferramenta, é acesso direto ao banco.
- Também não existe, em lugar nenhum do repositório, nenhuma integração de pagamento/checkout (procurei por Stripe, Hotmart, Kiwify, webhook — nada encontrado). Isso confirma que a venda de infoprodutos e a decisão de "quem comprou ganha convite" acontecem **inteiramente fora desta base de código** hoje — presumivelmente numa plataforma de vendas externa, com o convite sendo criado manualmente depois, por fora do produto.

**Conclusão:** não existe hoje uma ferramenta (script ou tela) para um administrador conceder um convite de beta manualmente a alguém — nem partindo da lista de fundadores, nem de uma compra de infoproduto. Confirmando a instrução da tarefa, **não construí nada disso agora** — fica registrado aqui como item para o futuro, quando essa necessidade for priorizada.
