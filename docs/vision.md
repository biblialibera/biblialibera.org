# Visão do produto

## O que é

O site do Biblia Libera, com duas partes:

1. **Landing page**: apresenta o projeto (o que é, por quê, a tradução e o
   texto original), com link para o repositório onde a tradução acontece
   (`open-bible`).
2. **Leitor**: onde a Bíblia de fato é lida.

## O leitor

Mostra o texto de um capítulo em duas versões, com um toggle:

- **Português**: tradução em português contemporâneo formal.
- **Original**: hebraico (WLC) ou grego (Nestle 1904/Septuaginta), conforme o
  livro.

Havia também um registro "Simples" (vocabulário acessível, frases curtas),
removido do site após revisão do conteúdo produzido; a tradução formal segue
como única versão em português por ora.

Cada versículo carrega notas (rodapé) onde o original é ambíguo; a UI precisa
exibir isso sem poluir a leitura corrida (ex: número sobrescrito com
popover/tooltip, não nota de rodapé de página como em PDF).

## Fonte do conteúdo

A lib npm `biblialibera` já existe e está publicada no npm (texto
estruturado por livro/registro, status de revisão por livro, notas em array
separado do texto limpo). O `core.js` do pacote lê os JSON do disco via `fs`, então
só funciona em Node: nada de importar `biblialibera/<lang>` ou os JSON de
livro inteiro em código que roda no navegador. O padrão adotado é extrair só
o trecho necessário para um JSON pequeno em `src/data/` via um script em
`scripts/` (ver `scripts/extract-demo-passage.mjs`, que alimenta a
demonstração viva do Salmo 23 na landing). O leitor completo (quando for
implementado) provavelmente precisa de uma abordagem diferente para navegar
o livro inteiro sem baixar tudo de uma vez; decidir na hora.

A lib carrega o texto original (hebraico/grego) via `biblialibera/original`,
usado pelo leitor e pela demo da landing.

## Futuro: comunidade

Direção pretendida, não implementar agora: leitores podem enviar sugestões e
anotações sobre o texto (ex: uma nota melhor, uma correção). Toda
contribuição entra com status baixo (não visível/não aplicada
automaticamente). Conforme o autor ganha reputação (contribuições aceitas,
revisão por outros), o status de novas contribuições sobe, até o ponto de
poder aceitar modificações com menos fricção. Não há modelo de dados, schema
de reputação ou UI definidos ainda; isso é intencional, revisitar quando o
leitor básico estiver no ar.
