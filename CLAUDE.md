# Biblia Libera: site instructions

Site do projeto Biblia Libera (biblialibera.org): landing page + leitor da
Bíblia. O conteúdo (textos originais e traduções) vem do repositório separado
`open-bible`, que faz a tradução assistida por IA e mantém o pipeline de
validação; este repo só consome esse conteúdo e apresenta.

- `docs/vision.md` — visão do produto e fluxo inicial (landing → leitor →
  futuro comunitário)

## Stack

- Vite + React + TypeScript, SPA (sem framework de servidor: sem Next.js). As
  únicas coisas que rodam no servidor são duas Vercel Functions em `api/`, e
  existem só para o preview de link (ver "Preview de link"); nenhuma página
  depende delas para renderizar.
- `react-router` para rotas (`/` landing, futuramente `/ler/...` para o
  leitor).
- npm como gerenciador de pacotes.
- Vitest + Testing Library para testes de componente.

## Design system

Origem: projeto "Biblia Libera Design System" no Claude Design (acessado via
`DesignSync`). Trazido para `src/design-system/`:

- `tokens/` — cores, tipografia, espaçamento, elevação, fontes (CSS custom
  properties; papel quente + tinta + acento oxblood, tema claro/escuro via
  `prefers-color-scheme`). `styles.css` é o ponto de entrada.
- `components/core/` — Button, Badge, Card (+ CardTitle/CardMeta), CodeBlock,
  DataTable.
- `components/reading/` — VerseBlock (+ Added, DivineName, FootnoteRef),
  Footnote/FootnoteList, RegisterToggle, ReviewSeal, BookNav: os componentes
  que o leitor vai usar.

Cada componente tem um `.test.tsx` ao lado (`npm run test`). Ao trazer
atualizações do design system, reconvertê-los fielmente ao `.jsx`/`.d.ts` de
origem (estilos inline com as mesmas CSS vars, mesma API de props), não
redesenhar por conta própria.

Logo trazido do projeto "Biblia Libera logo concepts" (conceito 3a, "The
Open Codex"): `BookMark` (ícone linear livro+luz), `SealMark` (selo
compacto, usado no favicon), `Logo` (lockup completo), em
`components/core/Logo.tsx`.

**Tema claro/escuro:** `data-theme` precisa ir no `:root` (`<html>`), nunca
numa div interna. Os aliases semânticos (`--color-bg`, `--color-text`, etc.)
são declarados só em `:root` referenciando a rampa crua (`--paper-0`,
`--ink-0`...); um alias declarado em `:root` resolve usando a rampa de
`:root` no momento em que é computado, então setar `data-theme` numa div
descendente troca a rampa mas os aliases continuam presos ao valor de
`:root`. `App.tsx` seta `document.documentElement.dataset.theme` via
`useEffect`, não um atributo na div wrapper.

## Regras de UI (a partir da landing page)

- **Sem CSS inline.** Componentes novos (fora do `design-system/` portado)
  usam Tailwind (`className`), nunca `style={{...}}`. Os componentes já
  portados do design system mantêm o padrão de origem (estilo inline via
  CSS vars) por fidelidade ao Claude Design; não converter.
- **Tudo em componente.** Qualquer pedaço de UI reaproveitável ou com lógica
  própria vira componente testado em `src/components/` (app-level) ou
  `src/design-system/components/` (portado do design system), não markup
  solto direto na página.
- Tailwind lê os tokens do design system via arbitrary values
  (`bg-[var(--color-bg)]`), não duplica a paleta na config do Tailwind.

**Tailwind + tokens do design system, `src/index.css`:** `@layer` sempre
perde de CSS sem layer, não importa a especificidade. `tokens/base.css` do
design system define seletores de elemento (`a`, `body`, `h1`...) que
precisam perder para utilitários Tailwind (`.no-underline` etc), então ele é
importado com `layer(base)`. Os outros tokens (cores, tipografia, espaço,
fontes) são só custom properties, sem conflito, ficam sem layer. Todo
`@import` (nosso e do Tailwind) tem que ficar contíguo no topo do arquivo,
sem nenhuma regra solta no meio, senão o bundler acusa CSS inválido.

## Conteúdo: como chega aqui

A lib npm `biblialibera` (do `open-bible`, `pipeline/build-package.js`) já
existe e está publicada no registry do npm: JSON estruturado por
livro/registro (`data/<lang>/<registro>/<Livro>.json`) mais um `core.js` que
lê do disco via `fs` (só funciona em Node, nunca no bundle do navegador).
Instalada como `devDependencies` (`^0.1.0`), não `dependencies`, porque só o
script de extração roda em Node; ver abaixo.

Padrão para trazer conteúdo real pro site: nunca importar
`biblialibera/<lang>` nem os JSONs de livro inteiro direto em código que roda
no navegador (um livro inteiro tem centenas de KB, e ainda inclui `fs`
transitivamente). Em vez disso, um script Node em `scripts/` lê o pacote e
gera um JSON pequeno, só com o trecho necessário, em `src/data/`; o
componente importa esse arquivo gerado.

- `scripts/extract-demo-passage.mjs` → `src/data/psalm23.json`: Salmo 23,
  vv. 1-4, tradução formal e original. Usado pela `RegisterDemo` (demo viva
  na landing).
- `scripts/extract-book-status.mjs` → `src/data/books.json`: lista de livros
  com status (`manifest.json` da lib), classificados AT/NT (a classificação
  é uma constante local, a lib não carrega cânon). Usado pela
  `BookStatusTable` na landing.
- `scripts/build-og-text.mjs` → `public/og/<slug>/<capitulo>.json`: o texto em
  pt de cada capítulo, sem notas e sem original, que as funções de preview
  buscam em runtime. Gerado, no `.gitignore`, regenerado no `prebuild`.
- `npm run sync-content` regenera todos; scripts individuais:
  `sync-demo-passage`, `sync-books`, `sync-reader`, `sync-themes`,
  `sync-og-text`.

## Índice temático (`/temas`)

Diferente do resto do conteúdo, o índice temático **não** vem do `open-bible`:
é curadoria escrita aqui, em `src/data/themes.source.json` (38 temas, cada um
com uma lista de passagens). `scripts/build-themes.mjs` resolve as referências
contra `src/data/reader/` e gera o que o site carrega:

- `src/data/themes/index.json` — um registro leve por tema (sem texto)
- `src/data/themes/<slug>.json` — as passagens do tema, com o texto

`src/data/themes/` é gerado e está no `.gitignore`: só a fonte curada é
versionada. Os hooks `predev`/`pretest`/`prebuild` no `package.json` rodam
`sync-themes` (~1s), então clone novo, teste e deploy regeneram sozinhos.

O texto dos versículos fica embutido nesses arquivos de propósito: cada tema
vira um chunk de ~2.5 KB carregado sob demanda. Guardar só a referência e
resolver no navegador exigiria baixar os livros inteiros do leitor, mediana de
1.4 MB por tema, para mostrar umas vinte linhas.

**Cada passagem carrega um `anchor`: as palavras iniciais da passagem, copiadas
do próprio texto.** O script exige que a passagem resolvida *comece* com ele e
falha se não começar. Isso não é enfeite: o Antigo Testamento aqui segue a
numeração hebraica (massorética), então referência decorada de edição em inglês
cai no versículo errado (Sl 51:10 é 51:12 aqui, Joel tem quatro capítulos,
Malaquias três). Sem os anchors, um bump do `biblialibera` que renumere
versículos reaponta o índice inteiro em silêncio. Conter o anchor não basta:
tem que ser o começo, senão um deslocamento de um versículo continua passando.

Para acrescentar um tema: escreva a referência, rode `npm run sync-themes`, e
copie de volta como anchor as palavras iniciais que ele reportar.

O índice foi montado com auxílio de IA e ainda **não passou por revisão
humana**; a página `/temas` diz isso ao visitante, e a promessa de honestidade
do projeto (os `ReviewSeal` do leitor) depende de continuar dizendo.

Não há busca ainda: por ora `/temas` só lista os temas e `/temas/:slug` mostra
as passagens. A busca sobre as passagens curadas está pronta mas guardada num
`git stash` ("themes view with thematic search"), fora do escopo por enquanto.

## Versículos linkáveis (`#v...`)

O leitor guarda o versículo ou intervalo selecionado no hash da URL: `#v16`,
`#v16-18`. Toda posição de leitura vira link compartilhável, e `/temas/:slug`
aponta cada passagem direto para os seus versículos (`passagePath`), não só
para o capítulo. O link que sai do botão Compartilhar usa a query
(`sharePath`, `?v=16-18`) em vez do hash; ver "Preview de link".

`src/components/verseSelection.ts` concentra a lógica pura (parse, formato,
máquina de estados da seleção); `verseInteraction.ts` devolve as props que
tornam um versículo clicável, usadas pelos dois registros (o texto em pt
passa pelo `VerseBlock` do design system, o original é um `<p>` próprio com
fonte e direção dele).

Pontos que não são óbvios e quebram se mexidos sem cuidado:

- **O hash é compartilhado com as notas de rodapé.** Por isso as âncoras das
  notas têm prefixo: `fn-<registro>-<n>` para a nota e `fnref-<registro>-<n>`
  para o marcador ao qual ela volta. `parseVerseHash` devolve três coisas
  diferentes: um intervalo, `null` (a URL diz que nada está selecionado) e
  `undefined` (a URL aponta para outra coisa, então mantenha a seleção atual).
  Sem esse `undefined`, clicar numa nota apagaria a passagem destacada. Ao
  renomear âncoras, procure por ids antigos no repo inteiro: a `RegisterDemo`
  da landing também emite notas.
- **Seleção navega com `replace: true`.** Clicar versículo a versículo não
  pode encher o histórico e prender o botão voltar.
- **Toque não tem shift.** Clique = um versículo, shift+clique estende a
  partir da âncora; no toque, tocar fora da seleção estende e tocar dentro
  colapsa para aquele versículo, que é a única saída de um intervalo sem
  modificador.
- **Shift+clique também é o gesto de selecionar texto do navegador**, e ele
  roda no `mousedown`, antes do clique chegar. Sem `preventDefault`, o
  navegador pinta a seleção nativa por cima do destaque e a guarda contra
  arrastar-para-copiar descarta o clique, que foi o que deixou o intervalo
  sem funcionar em navegador nenhum. O jsdom não seleciona texto sozinho,
  então o teste que cobre isso forja `window.getSelection`: sem forjar, a
  suíte fica verde com o gesto quebrado.
- **O destaque é `box-shadow`, não padding**, para selecionar um versículo
  nunca reposicionar a coluna ao redor.
- O efeito que rola até a passagem depende do livro carregado e do registro,
  nunca da seleção: senão cada clique arrastaria a página.

## Preview de link (o card que aparece no WhatsApp)

Colar um link do leitor num chat mostra um card com a passagem: referência,
texto, selo de revisão. É a razão de existirem `api/preview.ts` (as meta tags)
e `api/og.ts` (a imagem, 1200x630, via `@vercel/og`/Satori).

**O hash não chega ao servidor.** Por isso o link compartilhado leva a
passagem na query (`/ler/joao/3?v=16-18`) e não no hash: `#v16-18` é fragmento
de navegador e o crawler receberia só o capítulo. O leitor continua usando o
hash enquanto se lê; ao chegar por um link compartilhado ele adota o `?v=` e
devolve a seleção para o hash com `replace`, para as duas formas nunca estarem
na tela ao mesmo tempo dizendo o que está selecionado. `verseSelection.ts`
tem as duas (`parseVerseHash`, `parseVerseQuery`) e é importado tanto pelo
site quanto por `api/`: os dois lados precisam concordar até nos casos
malformados, então esse módulo não importa nada.

**Só crawler passa por função.** O `vercel.json` casa o user-agent
(WhatsApp, facebookexternalhit, Twitterbot, Telegram, Slack, Discord,
LinkedIn...) e só então reescreve para `/api/preview`; visitante humano
continua recebendo o `index.html` estático, sem nenhum salto de latência. A
query original é preservada e somada à do destino, que é como o `?v=` chega
na função. Buscadores ficam **de fora** da lista de propósito: o Google
renderiza JS e continua vendo o app de verdade, sem duas versões da mesma
página competindo no índice. O `index.html` carrega as tags do site como
fallback para qualquer unfurler não listado, em qualquer rota.

**As funções não podem importar `src/data/reader/`.** O `@vercel/og` limita
o bundle da função a 500KB contando assets, e o leitor tem 14MB. Daí
`public/og/<slug>/<capitulo>.json` (`scripts/build-og-text.mjs`): as funções
buscam por HTTP na própria CDN. A URL da imagem carrega só a rota
(`?kind=reader&slug=joao&chapter=3&v=16-18`), nunca o texto: o WhatsApp
cacheia preview por URL, e o texto tem que ser função do dado, não do que um
link velho escreveu.

Pontos que quebram sem aviso se mexidos:

- **Import relativo dentro de `api/` termina em `.js`, nunca `.ts`.** A Vercel
  não empacota essas funções: compila arquivo a arquivo e deixa o Node
  resolver em runtime, então `./passage.ts` aponta para um arquivo que não
  existe do outro lado e a função dá `ERR_MODULE_NOT_FOUND` em toda
  invocação. Foi assim que o primeiro deploy quebrou, com a suíte inteira
  verde: TypeScript e Vitest resolvem `./x.js` de volta para `x.ts`, só o
  runtime percebe. `api/_lib/handlers.test.ts` checa os specifiers como
  texto, que é o único jeito de pegar isso sem deploiar.
- **As funções exportam `export default { fetch }`**, não uma função solta.
  `export default async function handler(request)` é a assinatura antiga do
  Node: a Vercel chama com `(req, res)`, `req.url` vira caminho relativo e
  `new URL()` estoura. O mesmo teste trava o formato do export.
- **Todo `.ts` direto em `api/` vira uma função** (rota pública). Helper e
  teste ficam em `api/_lib/`: qualquer coisa sob diretório com underscore é
  ignorada pela Vercel.
- `npm run preview-og` roda com `tsx` e não com `node` por causa disso: com
  os specifiers em `.js`, o type stripping do Node não acha os `.ts`.
- **As fontes são baixadas do Google na hora de renderizar**, com subset pelo
  `&text=`: Satori só lê ttf/otf/woff, e três famílias inteiras comeriam o
  orçamento de 500KB. Pedir sem user-agent de navegador é o que faz o Google
  responder em truetype em vez de woff2. O subset precisa incluir o texto
  **em maiúsculas** também: o `textTransform: uppercase` roda dentro do
  Satori, depois da fonte escolhida, e as letras que faltarem saem em branco.
  `cardText()` existe para juntar tudo que o card desenha, inclusive o
  wordmark e os rótulos de selo, que não vêm do chamador.
- **Elemento sem filho não pode ter `children: []`**, tem que omitir a
  propriedade: o Satori lê array vazio como "mais de um filho" e exige
  `display: flex`. É o que o helper `el()` faz.
- **O tamanho do texto do card foi calibrado olhando o PNG**, não pela
  métrica da fonte: `npm run preview-og` escreve `.og-preview/*.png` rodando
  o mesmo código das funções, com o texto lido do disco. É assim que se
  mexe no card. `CARD_MAX_CHARS` é o que cabe nas cinco linhas do menor
  tamanho.
- A paleta e o `SealMark` estão duplicados em `api/_lib/card.ts` porque o
  Satori não resolve CSS var nem JSX do design system. Mudou
  `tokens/colors.css` ou o logo, atualiza lá também.

O que **não** dá para verificar local: o unfurl de verdade. Nem o script nem
os testes provam que o WhatsApp gostou das tags; isso exige URL pública,
então a checagem final é colar um link de um deploy de preview num chat.

## Fluxo inicial (o que estamos construindo agora)

1. Landing page (feita): apresenta o projeto, a tradução formal e o texto
   original, com link para o repositório de tradução.
2. Leitor (feito): mostra um livro/capítulo em português (formal) ou no
   original, com um toggle entre as duas, e com versículos linkáveis.
3. Índice temático (feito): `/temas` lista os temas e `/temas/:slug` mostra as
   passagens de um tema. O `SiteHeader` leva para lá.
4. Comunidade (futuro, não implementar agora): sugestões e anotações de
   usuários, com status inicial baixo, promovidas conforme reputação até
   poderem ser aceitas diretamente. Ver `docs/vision.md` para o racional;
   não há modelo de dados ou UI definidos ainda, é intencional.

## Conventions

- Commits em inglês, imperativo, sem trailers de atribuição.
- Nunca usar travessão (em dash) em nenhum lugar.
- Conteúdo de UI (textos visíveis ao usuário) em português; docs e código em
  inglês, seguindo a convenção do `open-bible`.
