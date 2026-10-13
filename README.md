# Biblia Libera

Site do [Biblia Libera](https://biblialibera.org): landing page e leitor da
Bíblia. O texto (original e traduzido) vem do repositório
[open-bible](https://github.com/biblialibera/open-bible), onde a tradução
acontece; este repo só consome e apresenta o conteúdo.

Ver `CLAUDE.md` e `docs/vision.md` para a visão do produto e as decisões de
arquitetura.

## Stack

Vite + React + TypeScript, SPA, `react-router`.

## Rodando localmente

```
npm install
npm run dev
```

```
npm run build     # build de produção
npm run lint      # oxlint
```

## Privacy policy

`/privacy` contains the Portuguese privacy policy for the website and the native
iPhone, iPad and Mac apps. The shared footer links to it. Keep the policy and its
update date in sync with changes to local storage, iCloud sync or external providers.
