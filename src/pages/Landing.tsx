import { Badge, Button, Card, CardMeta, CardTitle, CodeBlock, Logo } from '../design-system/components/core'
import { ReviewSeal } from '../design-system/components/reading'
import type { BookStatusRow } from '../components/BookStatusTable'
import { BookStatusTable } from '../components/BookStatusTable'
import { PipelineStepCard } from '../components/PipelineStepCard'
import { RegisterDemo } from '../components/RegisterDemo'
import { Section } from '../components/Section'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import booksData from '../data/books.json'

const GITHUB_URL = 'https://github.com/biblialibera/biblialibera'

const bookRows = booksData as BookStatusRow[]
const translatedCount = bookRows.filter((row) => row.status !== 'not-translated').length

const WHY_CARDS = [
  {
    meta: 'Domínio público',
    title: 'Linguagem de outro século',
    body: 'As Bíblias livres em português carregam um idioma de mais de cem anos: pronomes, sintaxe e vocabulário que ninguém mais usa.',
  },
  {
    meta: 'Traduções modernas',
    title: 'As atuais são fechadas',
    body: 'As traduções contemporâneas de qualidade têm copyright. Você pode ler, mas não copiar, adaptar nem construir sobre elas.',
  },
  {
    meta: 'Dados',
    title: 'Sem acesso estruturado',
    body: 'Não há a Bíblia em português atual como dado aberto e estruturado, algo que desenvolvedores possam usar de fato.',
  },
]

const PIPELINE_STEPS = [
  { number: '01', title: 'Originais', body: 'O ponto de partida é o texto hebraico e grego, nunca uma tradução intermediária.' },
  { number: '02', title: 'Tradução por IA', body: 'O modelo produz os dois registros a partir dos originais, seguindo um guia de estilo explícito.' },
  { number: '03', title: 'Validação', body: 'Checagens automáticas de formato, referências e consistência entre versículos.' },
  { number: '04', title: 'Auditoria de sentido', body: 'Cada versículo é auditado contra traduções de referência de domínio público, com o alinhamento calculado em código: reproduzível, aponta divergências para a revisão humana.' },
  { number: '05', title: 'Revisão humana', body: 'Leitura e correção final por pessoas. Só então um livro passa a "revisado".', accent: true },
]

export interface LandingProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

function Landing({ theme, onToggleTheme }: LandingProps) {
  const openGithub = () => window.open(GITHUB_URL, '_blank', 'noopener')
  const goToLer = () => document.getElementById('ler')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <SiteHeader theme={theme} onToggleTheme={onToggleTheme} onOpenGithub={openGithub} />

      <Section id="top" width="hero" bordered={false} center spacious>
        <Logo size={64} tagline={false} className="mb-[var(--space-8)] justify-center" />
        <div className="mb-[var(--space-5)] font-sans text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--color-text-faint)]">
          Tradução aberta · das línguas originais · CC BY 4.0
        </div>
        <h1 className="m-0 mb-[var(--space-5)] font-serif text-[var(--text-4xl)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[var(--color-text)]">
          A Bíblia em português de hoje, livre para todos
        </h1>
        <p className="mx-auto mb-[var(--space-8)] max-w-[36rem] text-[var(--text-md)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
          Traduzida do hebraico e do grego para o português brasileiro atual, em dois registros do mesmo sentido.
          Processo público e auditável. Texto e código abertos.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-[var(--space-3)]">
          <Button variant="primary" size="lg" onClick={goToLer}>
            Ler
          </Button>
          <Button variant="secondary" size="lg" onClick={openGithub}>
            Ver no GitHub
          </Button>
        </div>
        <div className="mt-[var(--space-8)] font-mono text-[var(--text-xs)] tracking-[0.02em] text-[var(--color-text-faint)]">
          {translatedCount} livros verificados · 2 registros · licença CC BY 4.0
        </div>
      </Section>

      <Section id="ler">
        <div className="mb-[var(--space-3)] font-sans text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--color-text-faint)]">
          Demonstração viva
        </div>
        <RegisterDemo />
      </Section>

      <Section>
        <div className="mx-auto mb-[var(--space-10)] max-w-[40rem] text-center">
          <div className="mb-[var(--space-3)] font-sans text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--color-text-faint)]">
            Por que existe
          </div>
          <h2 className="m-0 mb-[var(--space-3)] font-serif text-[var(--text-2xl)] text-[var(--color-text)]">
            Uma lacuna de três lados
          </h2>
          <p className="m-0 text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
            Não existe hoje a Bíblia em português atual, livre e estruturada. Cada opção resolve uma parte e falha em
            outra.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] items-start gap-[var(--space-5)]">
          {WHY_CARDS.map((card) => (
            <Card key={card.title}>
              <CardMeta>{card.meta}</CardMeta>
              <CardTitle>{card.title}</CardTitle>
              <p className="m-0 text-[var(--text-base)] leading-[var(--leading-normal)] text-[var(--color-text-secondary)]">
                {card.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto mb-[var(--space-10)] max-w-[40rem] text-center">
          <div className="mb-[var(--space-3)] font-sans text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--color-text-faint)]">
            Como funciona
          </div>
          <h2 className="m-0 mb-[var(--space-3)] font-serif text-[var(--text-2xl)] text-[var(--color-text)]">
            Um pipeline público, em cinco passos
          </h2>
          <p className="m-0 text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
            A IA traduz; o processo não é uma caixa-preta. Cada passo é código no GitHub, e cada resultado carrega o
            seu status.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] items-stretch gap-[var(--space-4)]">
          {PIPELINE_STEPS.map((step) => (
            <PipelineStepCard key={step.number} number={step.number} title={step.title} accent={step.accent}>
              {step.body}
            </PipelineStepCard>
          ))}
        </div>
        <div className="mx-auto mt-[var(--space-10)] max-w-[var(--reading-measure)]">
          <p className="m-0 mb-[var(--space-3)] font-sans text-[var(--text-sm)] text-[var(--color-text-muted)]">
            Cada versículo circula como Markdown estruturado, com o status declarado no próprio arquivo:
          </p>
          <CodeBlock filename="translations/pt/formal/Psalms.md" lang="markdown">
            {`## Salmo 23

**1** Salmo de Davi. O SENHOR é o meu pastor; nada me faltará.
**4** Mesmo que eu ande pelo vale da sombra da morte,^[Ou: "pelo vale da escuridão profunda".] não temerei mal algum...`}
          </CodeBlock>
        </div>
      </Section>

      <Section>
        <div className="mb-[var(--space-8)] max-w-[40rem]">
          <div className="mb-[var(--space-3)] font-sans text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--color-text-faint)]">
            Status honesto
          </div>
          <h2 className="m-0 mb-[var(--space-3)] font-serif text-[var(--text-2xl)] text-[var(--color-text)]">
            Onde estamos, sem maquiar
          </h2>
          <p className="m-0 mb-[var(--space-5)] text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
            {translatedCount} de {bookRows.length} livros já traduzidos e verificados na auditoria automática,
            entre protocanônicos, deuterocanônicos e o Novo Testamento. A revisão humana está em andamento; nenhum
            texto circula sem o status declarado.
          </p>
          <div className="flex flex-wrap items-center gap-[var(--space-3)]">
            <ReviewSeal status="draft" size="sm" detail />
            <ReviewSeal status="checked" size="sm" detail />
            <ReviewSeal status="reviewed" size="sm" detail />
          </div>
        </div>

        <BookStatusTable
          rows={bookRows}
          caption={`${bookRows.length} livros (com os deuterocanônicos) · ${translatedCount} traduzidos e verificados · revisão humana em andamento`}
        />

        <div className="mt-[var(--space-5)]">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="font-sans text-[var(--text-sm)] font-semibold">
            Ver o roadmap completo no GitHub →
          </a>
        </div>

        <div className="mx-auto mt-[var(--space-8)] max-w-[var(--reading-measure)] border-t border-[var(--color-border)] pt-[var(--space-6)]">
          <div className="mb-[var(--space-3)] flex flex-wrap items-center gap-[var(--space-3)]">
            <Badge mono>pt-BR</Badge>
            <span className="font-sans text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--color-text-faint)]">
              Idiomas
            </span>
          </div>
          <p className="m-0 text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
            Por ora, só em português brasileiro. O método parte das línguas originais, então não depende do
            português; outros idiomas estão no horizonte, pelo mesmo pipeline aberto. Ainda não há data.
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-[44rem]">
          <Card accent raised>
            <div className="mb-[var(--space-4)] flex flex-wrap items-center gap-[var(--space-3)]">
              <Badge tone="accent" mono>
                CC BY 4.0
              </Badge>
              <span className="font-sans text-[var(--text-sm)] text-[var(--color-text-muted)]">
                Creative Commons: Atribuição 4.0 Internacional
              </span>
            </div>
            <h2 className="m-0 mb-[var(--space-3)] font-serif text-[var(--text-xl)] text-[var(--color-text)]">
              Livre para ler, copiar e construir
            </h2>
            <p className="m-0 mb-[var(--space-4)] text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
              Você pode ler, distribuir, adaptar e usar, inclusive comercialmente, desde que dê o crédito. O texto e o
              código ficam abertos no GitHub, do primeiro rascunho à revisão final.
            </p>
            <p className="m-0 mb-[var(--space-5)] text-[var(--text-base)] leading-[var(--leading-normal)] text-[var(--color-text-secondary)]">
              Criado por <strong>Lucas Merencia</strong>.
            </p>
            <div className="flex flex-wrap gap-[var(--space-3)]">
              <Button variant="secondary" size="md" onClick={openGithub}>
                Texto e código no GitHub
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      <SiteFooter year={new Date().getFullYear()} />
    </>
  )
}

export default Landing
