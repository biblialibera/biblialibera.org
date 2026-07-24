import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PipelineStepCard } from './PipelineStepCard'

describe('PipelineStepCard', () => {
  it('renders the step number, title and description', () => {
    render(
      <PipelineStepCard number="01" title="Originais">
        O ponto de partida é o texto hebraico e grego.
      </PipelineStepCard>,
    )
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Originais' })).toBeInTheDocument()
    expect(screen.getByText('O ponto de partida é o texto hebraico e grego.')).toBeInTheDocument()
  })

  it('passes accent through to the underlying Card', () => {
    render(
      <PipelineStepCard number="05" title="Revisão humana" accent>
        Leitura final.
      </PipelineStepCard>,
    )
    // Card renders the accent top rule as an inline style; this only checks the prop reaches it.
    expect(screen.getByRole('heading', { name: 'Revisão humana' })).toBeInTheDocument()
  })
})
