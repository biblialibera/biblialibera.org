# Biblia Libera: site instructions

Site do projeto Biblia Libera (biblialibera.org): landing page + leitor da
Bíblia. O conteúdo (textos originais e traduções) vem do repositório separado
`open-bible`, que faz a tradução assistida por IA e mantém o pipeline de
validação; este repo só consome esse conteúdo e apresenta.

- `docs/vision.md` — visão do produto e fluxo inicial (landing → leitor →
  futuro comunitário)

## Stack

- Vite + React + TypeScript, SPA (sem framework de servidor: sem Next.js).
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
- `npm run sync-content` regenera todos; scripts individuais:
  `sync-demo-passage`, `sync-books`, `sync-reader`, `sync-themes`.

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

## Fluxo inicial (o que estamos construindo agora)

1. Landing page (feita): apresenta o projeto, a tradução formal e o texto
   original, com link para o repositório de tradução.
2. Leitor (feito): mostra um livro/capítulo em português (formal) ou no
   original, com um toggle entre as duas.
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
