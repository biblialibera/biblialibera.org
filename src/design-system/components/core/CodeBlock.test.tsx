import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CodeBlock } from './CodeBlock'

describe('CodeBlock', () => {
  it('renders the code content', () => {
    render(<CodeBlock>status: checked</CodeBlock>)
    expect(screen.getByText('status: checked')).toBeInTheDocument()
  })

  it('shows a filename header bar when given', () => {
    render(<CodeBlock filename="translations/pt/formal/Jonah.md">conteúdo</CodeBlock>)
    expect(screen.getByText('translations/pt/formal/Jonah.md')).toBeInTheDocument()
  })

  it('omits the header bar when no filename is given', () => {
    render(<CodeBlock>conteúdo</CodeBlock>)
    expect(screen.queryByText(/\.md$/)).not.toBeInTheDocument()
  })

  it('shows the language tag next to the filename', () => {
    render(
      <CodeBlock filename="canon.json" lang="json">
        {'{}'}
      </CodeBlock>,
    )
    expect(screen.getByText('json')).toBeInTheDocument()
  })
})
