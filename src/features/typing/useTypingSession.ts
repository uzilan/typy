import { useRef, useState } from 'react'
import {
  applyInput,
  createSession,
  getCharStates,
  getStats,
  type Session,
} from '../../engine/session'

interface State {
  source: string
  session: Session
  /** Raw input content; may hold a half-composed dead key the session hasn't seen. */
  inputValue: string
}

function initial(source: string): State {
  return { source, session: createSession(source), inputValue: '' }
}

export function useTypingSession(target: string) {
  const [state, setState] = useState(() => initial(target))
  const composing = useRef(false)

  // New text: start over (adjusting state during render, per React docs).
  if (state.source !== target) setState(initial(target))

  function score(value: string) {
    setState((s) => {
      const session = applyInput(s.session, value, Date.now())
      return { ...s, session, inputValue: session.typed }
    })
  }

  const { session, inputValue } = state
  return {
    session,
    inputValue,
    charStates: getCharStates(session),
    stats:
      session.finishedAt === null
        ? null
        : getStats(session, session.finishedAt),

    handleChange(value: string) {
      if (composing.current) setState((s) => ({ ...s, inputValue: value }))
      else score(value)
    },
    compositionStart() {
      composing.current = true
    },
    compositionEnd(value: string) {
      composing.current = false
      score(value)
    },
    restart() {
      composing.current = false
      setState(initial(target))
    },
  }
}
