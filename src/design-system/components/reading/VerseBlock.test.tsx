import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Added, DivineName, FootnoteRef, VerseBlock } from './VerseBlock'

describe('VerseBlock', () => {
  it('renders the superscript verse number and the verse text', () => {
    render(<VerseBlock number={3}>A palavra do Senhor veio a Jonas.</VerseBlock>)
    expect(screen.getByText('A palavra do Senhor veio a Jonas.')).toBeInTheDocument()
    expect(screen.getByLabelText('versículo 3')).toHaveTextContent('3')
  })

  it('dims the verse when marked as a non-focused parallel register', () => {
    render(
      <VerseBlock number={1} dim data-testid="verse">
        texto
      </VerseBlock>,
    )
    expect(screen.getByTestId('verse')).toHaveStyle({ color: 'var(--color-text-muted)' })
  })

  it('sets the verse id for anchoring', () => {
    render(
      <VerseBlock number={1} id="Jonah.1.1">
        texto
      </VerseBlock>,
    )
    expect(document.getElementById('Jonah.1.1')).toBeInTheDocument()
  })
})

describe('Added', () => {
  it('renders translator-supplied words in italic', () => {
    render(<Added>guardados</Added>)
    expect(screen.getByText('guardados')).toHaveStyle({ fontStyle: 'italic' })
  })
})

describe('DivineName', () => {
  it('defaults to "Senhor" in small caps', () => {
    render(<DivineName />)
    expect(screen.getByText('Senhor')).toHaveStyle({ fontVariant: 'small-caps' })
  })

  it('accepts custom children', () => {
    render(<DivineName>Deus</DivineName>)
    expect(screen.getByText('Deus')).toBeInTheDocument()
  })
})

describe('FootnoteRef', () => {
  it('renders as a button and calls onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<FootnoteRef n={1} onClick={onClick} />)
    const marker = screen.getByRole('button', { name: 'nota 1' })
    await user.click(marker)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders as a link when href is given', () => {
    render(<FootnoteRef n={2} href="#note-2" />)
    expect(screen.getByRole('link', { name: 'nota 2' })).toHaveAttribute('href', '#note-2')
  })
})
