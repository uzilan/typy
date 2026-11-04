import { getStats, type Session } from '../engine/session'

/** One finished try at an exercise. */
export interface Attempt {
  readonly id: string
  readonly exerciseId: string
  /** Epoch milliseconds. */
  readonly finishedAt: number
  readonly wpm: number
  /** Percent, 0–100. */
  readonly accuracy: number
  readonly elapsedMs: number
  readonly errors: number
  readonly keystrokes: number
  /** Positions in the text typed wrong at least once, ascending. */
  readonly errorPositions: readonly number[]
  /** Error count per expected character. */
  readonly missesByChar: Readonly<Record<string, number>>
}

export type NewAttempt = Omit<Attempt, 'id'>

export function toAttempt(session: Session, exerciseId: string): NewAttempt {
  const { finishedAt } = session
  if (finishedAt === null) throw new Error('Session is not finished')

  const { wpm, accuracy, elapsedMs, errors } = getStats(session, finishedAt)
  return {
    exerciseId,
    finishedAt,
    wpm,
    accuracy,
    elapsedMs,
    errors,
    keystrokes: session.keystrokes,
    errorPositions: [...session.errorPositions].sort((a, b) => a - b),
    missesByChar: { ...session.missesByChar },
  }
}
