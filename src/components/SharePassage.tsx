import { useState } from 'react'
import { Button } from '../design-system/components/core'

export interface SharePassageProps {
  /** The link to hand over: absolute, and carrying the passage in `?v=`. */
  url: string
  /** "João 3:16-18", what the share sheet announces. */
  reference: string
}

type State = 'idle' | 'copied' | 'failed'

const LABELS: Record<State, string> = {
  idle: 'Compartilhar',
  copied: 'Link copiado',
  failed: 'Não deu para copiar',
}

/**
 * Hands the current passage to whatever the reader shares with.
 *
 * On a phone this opens the system share sheet, which is how the link reaches
 * WhatsApp in one tap; everywhere else it copies the link. The share sheet gets
 * the reference as its text so the message reads as a passage rather than as a
 * bare URL, and the link itself carries `?v=` so it unfurls into that passage.
 */
export function SharePassage({ url, reference }: SharePassageProps) {
  const [state, setState] = useState<State>('idle')

  const announce = (next: State) => {
    setState(next)
    window.setTimeout(() => setState('idle'), 2500)
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: reference, text: reference, url })
        return
      } catch (error) {
        // Dismissing the sheet is a decision, not a failure: copying the link
        // behind the reader's back would undo it.
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      announce('copied')
    } catch {
      announce('failed')
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={share} aria-label={`Compartilhar ${reference}`}>
      {LABELS[state]}
    </Button>
  )
}
