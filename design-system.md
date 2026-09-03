# Sistema de Design — Run Again

Fonte única de verdade para cor, tipografia e componentes base do produto. Nenhum fluxo define token novo por conta própria — qualquer ajuste aqui é decisão de marca, feita neste arquivo, refletida depois em `app/globals.css` e `lib/tokens.ts`.

## Paleta

| Token | Hex | Uso |
|---|---|---|
| `--fire` | `#E8470A` | Accent. CTA primário, item ativo, número em destaque. Nunca fundo de texto corrido. |
| `--fire-dim` | `#E8470A18` (fire a 9.4% opacidade) | Fundo de badge/insight block sobre `--fire`. |
| `--ink` | `#0A0A0A` | Texto principal sobre fundo claro. Fundo de rodapé e telas de auth. |
| `--ink2` | `#1A1A1A` | Fundo secundário escuro (cards sobre `--ink`). |
| `--ink3` | `#242424` | Fundo terciário escuro (hover sobre `--ink2`). |
| `--mid` | `#6B6B6B` | Texto secundário, subtítulos, placeholders. |
| `--silver` | `#C8C8C8` | Texto corrido sobre fundo escuro (rodapé). |
| `--smoke` | `#F0EFED` | Fundo neutro alternativo, divisores. |
| `--paper` | `#FAFAF8` | Fundo padrão de área logada e header. |
| `--white` | `#FFFFFF` | Cards sobre `--paper`, texto sobre `--ink`. |

**Gap registrado:** o sistema não define vermelho de erro nem verde de sucesso. Decisão adotada — não introduzir cor nova:
- **Erro** usa `--fire` (já é a cor de alerta/urgência da marca).
- **Sucesso** não usa cor própria: ícone de check + tipografia padrão (`--ink` / `--mid`). `--fire` fica reservado a erro/accent.

## Tipografia

- **Bebas Neue** — headlines, títulos de tela, stats/números, labels de destaque. Nunca em corpo de texto.
- **Inter (300–900)** — todo o resto: corpo, labels de formulário, botões, navegação, microcopy.
- Palavra-chave de cada headline em `--fire` quando fizer sentido editorial (ex.: títulos de landing).

## Botões

Três variantes, sempre `border-radius: 100px`:

1. **Primary** — `background: var(--fire); color: white;`. Ação principal de cada tela.
2. **Ghost** — `border: 1px solid rgba(255,255,255,.18); color: white;`. Ação secundária sobre fundo escuro.
3. **Fire Ghost** — `background: var(--fire-dim); border: 1px solid rgba(232,71,10,.3); color: var(--fire);`. Ação terciária / link com peso visual, badges.

Todos os botões têm estado de `hover`, `focus-visible`, e `disabled` (opacidade reduzida + `cursor: not-allowed`, sem remover o token de cor).

## Componentes de card

- **Pillar Card** — fundo claro (`--white`), `border-bottom: 3px solid var(--fire)`, `border-radius: 14px`. Uso geral em área logada e estado vazio.
- **Insight Block** — `background: var(--fire-dim)`, `border: 1px solid rgba(232,71,10,.25)`, `border-radius: 16px`. Uso em estados de erro/alerta e destaques editoriais.
- **Persona Card / Feature Card / Number Card / Phase Card** — variações do Pillar Card reservadas para os fluxos de pilar (fisioterapia, preparo físico etc.); não implementadas neste fluxo de fundação.

## Outros componentes base

- **Input** — rótulo Inter, borda `--mid` em repouso, borda `--fire` em foco, borda `--fire` + mensagem Inter abaixo em estado de erro.
- **Badge** — estilo Fire Ghost, texto Inter 700 10px uppercase, `letter-spacing: 0.16em`, `border-radius: 100px`.
- **Avatar** — iniciais sobre `--ink2`, texto `--white`, círculo.
- **Eyebrow** — Inter 700 10px uppercase `--fire`, acima de headlines Bebas Neue.

## Tom de voz

Direto, científico, humano, empoderador. Nunca diminutivo, nunca pedido de desculpa ("foi mal", "ops!"), nunca infantilização. Vocabulário aprovado: protocolo, ecossistema, retorno ao esporte, evidência científica, progressão, corredor, antifrágil, Returnista, carga de vida. Evitar: app de fitness, planilha, treino genérico, wellness lifestyle, assessoria.
