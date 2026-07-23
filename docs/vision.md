# Visão do produto

## O que é

O site do Biblia Libera, com duas partes:

1. **Landing page**: apresenta o projeto (o que é, por quê, os dois
   registros de tradução), com link para o repositório onde a tradução
   acontece (`open-bible`).
2. **Leitor**: onde a Bíblia de fato é lida.

## O leitor

Mostra o texto de um capítulo em três versões:

- **Formal**: português contemporâneo formal.
- **Simples**: vocabulário acessível, frases curtas.
- **Original**: hebraico (WLC) ou grego (Nestle 1904/Septuaginta), conforme o
  livro.

Formal e simples vêm do mesmo texto-fonte e da mesma base exegética,
diferindo em registro, não em interpretação (ver `docs/` do `open-bible`).

Navegação entre as três é o ponto em aberto de UX: pode ser abas, um toggle,
ou lado a lado dependendo do espaço de tela. Decidir na hora de implementar o
leitor, não precisa fechar isso agora.

Cada versículo carrega notas (rodapé) onde o original é ambíguo; a UI precisa
exibir isso sem poluir a leitura corrida (ex: número sobrescrito com
popover/tooltip, não nota de rodapé de página como em PDF).

## Fonte do conteúdo

O texto estruturado (original + traduções, com status de revisão por
versículo) vai ser publicado pelo `open-bible` como uma lib npm, e este site
instala essa lib como dependência normal. Enquanto ela não existe, o leitor
trabalha com dados de exemplo hardcoded no próprio site (ex: Judas, Jonas,
que já estão traduzidos e revisados no `open-bible`) só para validar o fluxo
de UI; trocar pela lib real é um passo isolado, não deve exigir reescrever o
leitor.

O formato de origem (antes de virar JSON da lib) está documentado em
`docs/format.md` e `pipeline/parse-translation.js` do `open-bible`: cada
versículo tem um id (`<Livro>.<capítulo>.<versículo>`, ex: `Jonah.1.3`) e
texto com marcação de nota (`^[...]`) e palavra adicionada pelo tradutor
(itálico). O JSON da lib deve preservar isso o suficiente pra UI renderizar
notas e itálicos corretamente; formato exato da lib é decisão do
`open-bible`, não deste repo.

## Futuro: comunidade

Direção pretendida, não implementar agora: leitores podem enviar sugestões e
anotações sobre o texto (ex: uma nota melhor, uma correção). Toda
contribuição entra com status baixo (não visível/não aplicada
automaticamente). Conforme o autor ganha reputação (contribuições aceitas,
revisão por outros), o status de novas contribuições sobe, até o ponto de
poder aceitar modificações com menos fricção. Não há modelo de dados, schema
de reputação ou UI definidos ainda; isso é intencional, revisitar quando o
leitor básico estiver no ar.
