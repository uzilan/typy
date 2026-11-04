/**
 * Typing session logic. Pure functions, no React, no clock:
 * callers pass the current time in milliseconds.
 */

export interface Session {
  readonly target: string
  /** What is currently in the input (NFC, never longer than target). */
  readonly typed: string
  readonly startedAt: number | null
  readonly finishedAt: number | null
  /** Characters added (deletions are not keystrokes). */
  readonly keystrokes: number
  /** Characters added that did not match the target. */
  readonly errors: number
  /** Positions that were ever typed wrong, even if corrected later. */
  readonly errorPositions: ReadonlySet<number>
  /** Error count per expected character. */
  readonly missesByChar: Readonly<Record<string, number>>
}

export interface Stats {
  wpm: number
  /** Percent, 0–100. */
  accuracy: number
  elapsedMs: number
  correctChars: number
  errors: number
}

export type CharState = 'correct' | 'incorrect' | 'current' | 'pending'

export function createSession(target: string): Session {
  return {
    target: target.normalize('NFC'),
    typed: '',
    startedAt: null,
    finishedAt: null,
    keystrokes: 0,
    errors: 0,
    errorPositions: new Set(),
    missesByChar: {},
  }
}

function commonPrefixLength(a: string, b: string): number {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return i
}

/** Applies the full current input value. Returns the same session if nothing changed. */
export function applyInput(
  session: Session,
  value: string,
  now: number,
): Session {
  if (session.finishedAt !== null) return session

  const { target } = session
  const typed = value.normalize('NFC').slice(0, target.length)
  if (typed === session.typed) return session

  let keystrokes = session.keystrokes
  let errors = session.errors
  const errorPositions = new Set(session.errorPositions)
  const missesByChar = { ...session.missesByChar }

  for (
    let i = commonPrefixLength(session.typed, typed);
    i < typed.length;
    i++
  ) {
    keystrokes++
    const expected = target[i] as string
    if (typed[i] !== expected) {
      errors++
      errorPositions.add(i)
      missesByChar[expected] = (missesByChar[expected] ?? 0) + 1
    }
  }

  const added = keystrokes > session.keystrokes
  return {
    target,
    typed,
    startedAt: session.startedAt ?? (added ? now : null),
    finishedAt: typed.length === target.length ? now : null,
    keystrokes,
    errors,
    errorPositions,
    missesByChar,
  }
}

export function getStats(session: Session, now: number): Stats {
  const { target, typed, startedAt, finishedAt, keystrokes, errors } = session

  let correctChars = 0
  for (let i = 0; i < typed.length; i++)
    if (typed[i] === target[i]) correctChars++

  const elapsedMs = startedAt === null ? 0 : (finishedAt ?? now) - startedAt
  const minutes = elapsedMs / 60_000

  return {
    wpm: minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0,
    accuracy:
      keystrokes > 0
        ? Math.round((100 * (keystrokes - errors)) / keystrokes)
        : 100,
    elapsedMs,
    correctChars,
    errors,
  }
}

export function getCharStates(session: Session): CharState[] {
  const { target, typed, finishedAt } = session
  return [...target].map((ch, i): CharState => {
    if (i < typed.length) return typed[i] === ch ? 'correct' : 'incorrect'
    if (i === typed.length && finishedAt === null) return 'current'
    return 'pending'
  })
}
