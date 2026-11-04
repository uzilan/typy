import type { Attempt } from '../../storage/attempt'

export interface AttemptRow {
  attempt: Attempt
  /** 1 = first attempt at this exercise. */
  number: number
  isCurrent: boolean
  isBest: boolean
  /** Bar width relative to the fastest attempt, 0–100. */
  barPct: number
}

export interface Summary {
  current: Attempt
  attemptNumber: number
  isBest: boolean
  /** Newest first. */
  rows: AttemptRow[]
}

/**
 * Summarizes all attempts at one exercise around the current one.
 * Best = highest WPM; on a tie the earlier attempt keeps the record.
 */
export function summarize(attempts: Attempt[], currentId: string): Summary {
  const chronological = [...attempts].sort(
    (a, b) => a.finishedAt - b.finishedAt,
  )
  const current = chronological.find((a) => a.id === currentId)
  if (!current) throw new Error(`Attempt ${currentId} not found`)

  let best = chronological[0] as Attempt
  for (const a of chronological) if (a.wpm > best.wpm) best = a
  const maxWpm = best.wpm

  const rows = chronological
    .map((attempt, i): AttemptRow => ({
      attempt,
      number: i + 1,
      isCurrent: attempt === current,
      isBest: attempt === best,
      barPct: maxWpm > 0 ? Math.round((100 * attempt.wpm) / maxWpm) : 0,
    }))
    .reverse()

  return {
    current,
    attemptNumber: chronological.indexOf(current) + 1,
    isBest: current === best,
    rows,
  }
}

export interface HardChar {
  char: string
  count: number
}

/** Characters missed, most misses first, ties in Swedish alphabetical order. */
export function hardChars(missesByChar: Record<string, number>): HardChar[] {
  return Object.entries(missesByChar)
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count || a.char.localeCompare(b.char, 'sv'))
}
