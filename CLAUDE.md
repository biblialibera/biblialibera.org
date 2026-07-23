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

## Conteúdo: como chega aqui

Decisão: o `open-bible` vai publicar uma lib npm com o texto estruturado em
JSON (traduções + original), versionada junto com o avanço das traduções.
Este site instala essa lib como dependência normal (`npm install`), sem
submodule e sem build step customizado lendo os arquivos do outro repo
diretamente. Enquanto essa lib não existe, o leitor usa dados de exemplo
hardcoded (ver `docs/vision.md`).

## Fluxo inicial (o que estamos construindo agora)

1. Landing page (feita): apresenta o projeto, os dois registros (formal,
   simples) e o texto original, com link para o repositório de tradução.
2. Leitor: mostra um livro/capítulo nas três versões (formal, simples,
   original), com navegação entre elas. Ainda não implementado.
3. Comunidade (futuro, não implementar agora): sugestões e anotações de
   usuários, com status inicial baixo, promovidas conforme reputação até
   poderem ser aceitas diretamente. Ver `docs/vision.md` para o racional;
   não há modelo de dados ou UI definidos ainda, é intencional.

## Conventions

- Commits em inglês, imperativo, sem trailers de atribuição.
- Nunca usar travessão (em dash) em nenhum lugar.
- Conteúdo de UI (textos visíveis ao usuário) em português; docs e código em
  inglês, seguindo a convenção do `open-bible`.
