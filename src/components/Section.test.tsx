import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Section } from './Section'

describe('Section', () => {
  it('renders children inside a section landmark', () => {
    render(<Section>conteúdo</Section>)
    expect(screen.getByText('conteúdo').closest('section')).toBeInTheDocument()
  })

  it('has a top border by default', () => {
    render(<Section data-testid="section">conteúdo</Section>)
    expect(screen.getByTestId('section').className).toContain('border-t')
  })

  it('omits the top border when bordered is false', () => {
    render(
      <Section bordered={false} data-testid="section">
        conteúdo
      </Section>,
    )
    expect(screen.getByTestId('section').className).not.toContain('border-t')
  })

  it('uses the hero width and centers text when requested', () => {
    render(
      <Section width="hero" center spacious data-testid="section">
        conteúdo
      </Section>,
    )
    const className = screen.getByTestId('section').className
    expect(className).toContain('max-w-[52rem]')
    expect(className).toContain('text-center')
    expect(className).toContain('pt-[var(--space-24)]')
  })

  it('forwards the id for anchor navigation', () => {
    render(<Section id="ler">conteúdo</Section>)
    expect(document.getElementById('ler')).toBeInTheDocument()
  })
})
