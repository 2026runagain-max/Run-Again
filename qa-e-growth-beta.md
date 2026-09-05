# QA e Growth do Piloto Beta — Run Again

**Data:** 2026-09-04
**Branch de correções:** `beta-qa-e-growth` (a partir de `main`, integrando também os fluxos de Nutrição, Psicologia do Esporte e Comunidade — ver nota abaixo)
**Metodologia:** simulação manual dos fluxos principais como a Returnista percorreria (cadastro por convite, onboarding/diagnóstico, painel, nutrição, psicologia, comunidade, site aberto), em navegador real contra o Supabase de desenvolvimento, complementada por leitura de código nos pontos de cálculo (score de risco, carga/forma, radar de capacidades, motor de nutrição) e nas validações de formulário.

## Nota de escopo — integração necessária antes de testar

Os fluxos de Nutrição Esportiva, Psicologia do Esporte e Comunidade existiam, até esta sessão, **só no clone local** — nunca haviam sido enviados ao repositório remoto, então não dava pra testar o produto "como a Returnista usaria" sem juntar tudo numa única branch primeiro. A branch `beta-qa-e-growth` faz isso (merge de `main` + os três fluxos). Ao integrar, duas migrations colidiram em número (0006 e 0007 duplicados) — corrigido por renumeração antes de qualquer outro teste (ver Bug #1).

---

## Bugs encontrados e corrigidos (BLOCKER / HIGH)

### 1 — [BLOCKER] Colisão de numeração de migrations
`0006_nutricao_esportiva.sql` colidia com `0006_lista_fundadoras.sql`, e `0007_psicologia_esportiva.sql` colidia com `0007_remove_medicina_esporte.sql` (as duas últimas já em `main`). Ter dois arquivos com o mesmo número quebra qualquer ferramenta de aplicar migration em ordem. **Corrigido:** renumerado para 0006 lista_fundadoras · 0007 nutrição · 0008 psicologia · 0009 comunidade · 0010 remove_medicina_esporte, com os comentários internos que citavam os números antigos também atualizados. Nenhuma mudança de schema.

### 2 — [HIGH] Header oferece links que o próprio app bloqueia sem explicação
Antes de terminar a avaliação inicial (persona ainda não definida), o header já mostrava Nutrição, Psicologia, Comunidade, Minha Recuperação e Início — mas clicar em qualquer um deles fazia o middleware redirecionar de volta pra `/corredor/comecar` **sem nenhuma mensagem**. Pra quem está vendo a tela pela primeira vez, o clique simplesmente "não fazia nada" — um ponto sem saída clássico logo na entrada do produto.
**Corrigido em duas camadas:**
- O header agora esconde esses links enquanto a persona não existe (só mostra "Perfil", que é o único outro lugar que realmente abre).
- Para quem chegar direto pela URL (aba salva, histórico, botão voltar), o middleware agora manda um parâmetro (`bloqueado`) e `/corredor/comecar` mostra um aviso curto explicando por que a página pedida ainda não abre — ex.: *"Nutrição abre assim que você termina esta avaliação — é o que dá à Equipe Run Again o retrato pra te acompanhar aí."*

### 3 — [HIGH] Bloco A do questionário deixava avançar com metade das respostas faltando
O botão "Continuar" do Bloco A (histórico de lesão) só verificava se "Sim/Não" tinha sido respondido — não os outros 4 campos que aparecem quando a resposta é "Sim" (região, tratamento, situação atual, tempo parado). Dava pra clicar em "Continuar" tendo respondido só "Sim", e o clique falhava no servidor com uma mensagem genérica ("Escolhe uma opção pra continuar.") que não dizia qual das 4 perguntas estava faltando — a Returnista ficava tendo que adivinhar e rolar a tela de novo.
**Corrigido:** o botão agora usa o mesmo critério de completude que o servidor já usava internamente (`blocoACompleto`), então só habilita quando as 4 respostas condicionais existem de verdade.

### 4 — [HIGH] Resíduo de "Medicina do Esporte" no painel do corredor (real, visível, pós-onboarding)
Uma tarefa anterior removeu o pilar "Medicina do Esporte" da estratégia de produto, mas a busca daquela vez usava uma expressão regular que só permitia até 3 caracteres entre "medicina" e "esporte" — e "medicina **do** esporte" tem 4. Dois lugares escaparam:
- O texto de boas-vindas do painel prometia que "nutrição, medicina do esporte, psicologia" iam aparecer ali com o tempo.
- A lista de pilares "em construção" do painel **mostrava um card real** — "Medicina do esporte · Em construção" — para qualquer corredor logado, prometendo um pilar que nunca vai existir.
**Corrigido** nos dois lugares (`lib/painel/copy.ts`). Confirmado visualmente: o painel de um corredor recém-cadastrado não cita mais medicina do esporte em lugar nenhum.

---

## Achados MEDIUM / LOW — não corrigidos nesta rodada (com justificativa)

| # | Achado | Severidade | Por que não bloqueia o lançamento |
|---|---|---|---|
| 1 | Alguns campos usam validação nativa do navegador (`required`/`min`/`max` HTML) em vez da mensagem de marca — ex.: "km por semana" no Bloco C do onboarding, Título/Corpo do tópico novo na Comunidade. Sem `noValidate`, o navegador mostra seu próprio popup em vez do padrão visual do produto. | MEDIUM | O valor inválido é rejeitado de verdade (sem corromper dado), e a maioria dos navegadores desktop mostra alguma mensagem. Risco maior é em mobile, onde esse popup às vezes não aparece bem — mas cada tela afetada tem só 1–3 campos, então o usuário não fica sem pista nenhuma pra onde olhar. Corrigir isso em escala é redesenhar a validação de ~7 telas, não um patch pontual — não caberia no orçamento desta rodada sem sacrificar os bugs que realmente travam alguém. |
| 2 | Mensagem de erro genérica ("Escolhe uma opção pra continuar.") não diz qual campo falta, nos blocos B, D e F (2–3 campos obrigatórios cada). | MEDIUM | Corrigi só o Bloco A (4 campos condicionais — o pior caso, quase um BLOCKER). Os demais blocos têm no máximo 2–3 perguntas numa tela curta (no máximo 1 rolagem), então o custo de "adivinhar de novo" é pequeno. Fica como item de polimento futuro. |
| 3 | Diagnóstico inicial não tinha nenhum botão pra seguir pro painel — só "Atualizar minha avaliação" (reabre o wizard). | MEDIUM (corrigido de graça) | Como o ajuste era de baixo risco e direto (um botão), aproveitei pra corrigir mesmo não sendo BLOCKER/HIGH: adicionei "Ver meu painel" como CTA primário logo após o diagnóstico. |
| 4 | Grade de "pilares chegando" no painel, com só 1 item restante (Preparo Físico) depois de remover Medicina do Esporte, ocupa metade de uma grade de 2 colunas. | LOW | Não é o mesmo problema de "buraco" que a home teve (lá era 3 colunas com 2 itens sobrando) — 1 item em 2 colunas lê normal, sem parecer quebrado. |
| 5 | Testes de viewport mobile via automação de navegador não funcionaram de forma confiável nesta sessão (redimensionar a janela não teve efeito no que foi capturado). | — | Cobertura mobile ficou apoiada em revisão de código (classes responsivas do Tailwind usadas de forma consistente em toda a base, incluindo o menu hambúrguer do header) em vez de captura visual direta. Recomendo uma rodada curta de QA manual em celular real antes de convidar os 50 testers. |

**Uma conta de teste ficou criada no Supabase de desenvolvimento** (`qa.returnista.beta@runagain.test`, nome "QA Returnista Teste") — mesma convenção de outras contas de teste já existentes no projeto (`*.test`, "Corredora Teste" etc.). Não apaguei sem confirmar — avise se quiser que eu remova.

---

## A promessa central (para quem vai testar o beta)

> **Você não vai voltar a treinar forte sozinha, no escuro, torcendo pra não se machucar de novo. O Run Again junta fisioterapia, preparo físico, nutrição e psicologia do esporte numa jornada só — pra que o jeito de voltar seja tão cuidado quanto a vontade de voltar.**

Essa promessa já está construída no produto, não é aspiracional: o diagnóstico nomeia o medo como dado real (não fraqueza), o painel nunca cobra número sem explicar o porquê, e a Comunidade existe pra lembrar a Returnista que ela não é a única. A tarefa do piloto é confirmar, com gente de verdade, que essa promessa se sustenta na prática — não inventar uma nova.

## Onboarding de ativação — a primeira coisa que ela precisa ver e sentir

A primeira sessão de uso tem uma sequência já construída que funciona bem e não deveria ser abreviada nem "otimizada" pra ser mais curta:

1. **Cadastro pelo código de convite** — sem fricção, sem cartão.
2. **"A gente vai te fazer perguntas de verdade"** — a tela que avisa, antes de começar, que o questionário alimenta a conversa com a Equipe de verdade (não é "só mais um form").
3. **O diagnóstico** — a tela mais importante de toda a ativação. É onde ela lê "Você é uma Returnista: já sabe o preço de errar de novo..." pela primeira vez, e onde o medo dela vira um "ponto de atenção prioritário" nomeado, não um número solto. **Isso precisa acontecer sem fricção nenhuma** — qualquer bug nessa etapa (como o Bug #3 acima) tem custo desproporcional, porque é o primeiro momento em que o produto "vê" ela de verdade.
4. **O painel, ainda vazio** — precisa deixar claro que "vazio" não é "quebrado": é "ainda não temos seu retorno de ontem", não um erro.

Recomendação prática pro piloto: a mensagem de convite (abaixo) e o primeiro contato humano da Equipe devem reforçar verbalmente o passo 2 — avisar que o questionário é longo e por quê — pra reduzir abandono no meio do onboarding.

## O AHA moment — quando ela sente que o corpo aguenta

Não é o diagnóstico (esse é o momento de **ser vista**, não de **confiar no corpo**). O AHA de verdade, hoje já construído no produto, é:

> **A primeira vez que ela responde como se sentiu depois de uma sessão prescrita (resposta de 24h) e volta ao painel no dia seguinte pra ver que a tela mudou por causa da resposta dela** — carga/forma, risco e o card de bem-estar deixam de mostrar o estado genérico do diagnóstico e passam a refletir o que ela mesma reportou.

É o momento em que "cuidado não é pegar leve, é pegar certo" deixa de ser frase de manifesto e vira uma tela que reage a ela especificamente. Antes disso, é confiança na promessa; depois disso, é confiança no protocolo. Vale medir especificamente **quantos dias até essa primeira resposta de 24h** — é o proxy mais direto de "o produto começou a valer a pena".

## Métricas essenciais para acompanhar durante os 90 dias

Piloto pequeno (até 50 pessoas) — todas essas dão pra apurar manualmente numa planilha, sem instrumentação nova:

**Ativação (semana 1)**
- % que completa cadastro → diagnóstico concluído (e em qual bloco quem abandona, se abandonar)
- Dias até a primeira resposta de 24h (o proxy do AHA moment, acima)

**Uso continuado (semanal, todo o período)**
- % de sessões prescritas com resposta de 24h registrada (aderência real, não só "abriu o app")
- % de testers ativos em mais de 1 pilar (fisioterapia + nutrição e/ou psicologia) — sinal de que o "ecossistema integrado" está sendo sentido, não só a fisioterapia isolada
- Frequência de zona amarela/vermelha nas respostas de 24h (sinal de segurança clínica, não de performance)

**Comunidade (proxy de pertencimento)**
- Nº de evidências compartilhadas do painel pro feed
- Nº de tópicos e respostas no espaço de conversa
- % de testers que leram o feed pelo menos 1x/semana, mesmo sem postar

**Qualitativo (recolhido manualmente, em conversa)**
- Uma pergunta fixa, repetida a cada contato: *"Você recomendaria o Run Again pra outra Returnista que você conhece?"* — não precisa virar NPS formal, mas precisa ser feita sempre da mesma forma pra comparar ao longo dos 90 dias.
- Qualquer citação espontânea sobre "senti que o corpo aguentava" ou o oposto — registrar literalmente, sem parafrasear, pra virar prova social real mais adiante (nunca fabricada).

**Risco / abandono**
- Quem para de responder por mais de 7 dias corridos — lista nominal pra contato ativo da Equipe, não só um número agregado.

## FAQ de objeções

**"Fisioterapia é só pra quando eu já me machuquei — eu tô tentando não repetir, não tratando de novo."**
Faz sentido pensar assim, porque foi assim que a fisioterapia te tratou da última vez: só depois que já doía. Aqui é o oposto — o protocolo entra no seu retorno *antes* da carga voltar a subir, junto com preparo físico e o resto do ecossistema, exatamente pra você não precisar visitar a fisioterapia de novo pelo mesmo motivo.

**"Eu já tenho um app de treino, não preciso de mais um."**
Um app de treino te dá uma planilha de quilômetros. O Run Again não substitui isso — ele resolve o que nenhum app de treino resolve: o que acontece com seu corpo fora do treino (sono, carga de vida, medo de se machucar de nov) e que decide se aquele plano de km é seguro pra você essa semana ou não.

**"Não tenho tempo pra mais uma coisa pra gerenciar."**
O ponto do Run Again é o oposto de "mais uma coisa": é o lugar que já leva em conta que você trabalha, dorme mal às vezes e não vive só pra correr — a "carga de vida" entra na conta do protocolo, em vez de fingir que você tem uma vida de atleta em tempo integral.

**"Já tentei fisioterapia antes e não resolveu."**
Então você já sabe o que fisioterapia genérica parece por dentro. A diferença aqui não é "mais uma sessão" — é o protocolo considerar o que você contou sobre medo, rotina e histórico desde o primeiro dia, em vez de tratar só o joelho como se ele existisse sozinho.

**"Tenho vergonha de admitir que tenho medo de treinar forte de novo."**
Você não precisa admitir nada pra ninguém além do questionário — e o que ele te devolve não é "você está exagerando", é o oposto: o medo vira dado, tratado com o mesmo rigor de qualquer outro sinal clínico. Ninguém no Run Again vai tratar isso como fraqueza.

## Roteiro de mensagem de convite (50 selecionados)

*(Enviar individualmente, nunca em lista de transmissão — cada pessoa foi escolhida por um motivo específico: já comprou um infoproduto do Run Again, o que já prova que tirou o cartão do bolso por essa causa.)*

---

Oi, [nome] — aqui é [nome de quem convida], do Run Again.

Você comprou [o ebook "Corrida sem Lesão" / o planner / o curso] há um tempo, e por isso você é uma das 50 pessoas que estamos convidando pessoalmente pro **piloto do Run Again** — a versão completa do ecossistema que só existia em pedaços até agora.

**O que é:** um app (funciona direto no navegador, sem instalar nada) que junta fisioterapia, preparo físico, nutrição esportiva e psicologia do esporte numa jornada só, pensado especificamente pra quem está voltando a treinar depois de uma lesão ou parada.

**Por quanto tempo:** 90 dias, começando quando você aceitar o convite.

**Quanto custa:** nada. Zero. Não tem tela de pagamento nessa versão — é 100% gratuito durante todo o piloto, sem pedir cartão em nenhum momento.

**O que a gente pede em troca:** que você use de verdade — responda o questionário inicial com sinceridade, registre como se sentiu depois das sessões, e converse com a gente quando algo não fizer sentido. Isso não é feedback de "corrigir bug depois" — é literalmente o que decide se o protocolo funciona pra gente seguir construindo.

**Como dar feedback:** [canal específico — e-mail direto da equipe / grupo fechado, o que já estiver decidido]. Sem burocracia: se travou, se doeu de menos ou de mais, se uma tela te confundiu, é isso que a gente mais quer ouvir — mesmo (principalmente) quando for coisa pequena.

Seu código de convite é: **[CÓDIGO]** — o link é [link do cadastro].

Se topar, a gente também quer te ouvir sobre como foi comprar [o infoproduto] — isso ajuda a gente a entender melhor quem já confiou na gente antes desse convite existir.

Bem-vinda de volta.
— Equipe Run Again

---

## Verificação

`tsc --noEmit`, `eslint` e `next build` (45 rotas, integrando os 3 fluxos antes locais) passam limpos depois de todas as correções. Cada bug corrigido foi re-testado manualmente no navegador contra a mudança feita (ver histórico da simulação nesta sessão) — não só verificado por leitura de código.

**Branch:** `beta-qa-e-growth`, criada a partir de `main` (com merge de `feature/painel-progresso` pra trazer Nutrição/Psicologia/Comunidade, que só existiam localmente). Já enviada ao repositório remoto. Não fiz merge — fica pra aprovação humana.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
