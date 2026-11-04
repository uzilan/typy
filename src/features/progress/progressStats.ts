import type { Attempt } from '../../storage/attempt'

export type Range = 'recent' | 'all'
export const RECENT_COUNT = 20

export interface NumberedAttempt {
  /** 1 = first attempt ever (across all exercises). */
  number: number
  attempt: Attempt
}

/** Attempts oldest first, numbered overall; 'recent' keeps the last 20. */
export function selectRange(
  attempts: Attempt[],
  range: Range,
): NumberedAttempt[] {
  const numbered = [...attempts]
    .sort((a, b) => a.finishedAt - b.finishedAt)
    .map((attempt, i) => ({ number: i + 1, attempt }))
  return range === 'recent' ? numbered.slice(-RECENT_COUNT) : numbered
}

export interface ProgressSummary {
  attempts: number
  /** Highest WPM (earliest on a tie). */
  best: { wpm: number; exerciseId: string } | null
  avgWpm: number
  avgAccuracy: number
}

export function progressSummary(selected: NumberedAttempt[]): ProgressSummary {
  if (selected.length === 0) {
    return { attempts: 0, best: null, avgWpm: 0, avgAccuracy: 0 }
  }
  let best = selected[0]!.attempt
  let wpmSum = 0
  let accSum = 0
  for (const { attempt } of selected) {
    if (attempt.wpm > best.wpm) best = attempt
    wpmSum += attempt.wpm
    accSum += attempt.accuracy
  }
  return {
    attempts: selected.length,
    best: { wpm: best.wpm, exerciseId: best.exerciseId },
    avgWpm: Math.round(wpmSum / selected.length),
    avgAccuracy: Math.round(accSum / selected.length),
  }
}

export interface Point {
  number: number
  value: number
}

export function series(
  selected: NumberedAttempt[],
  metric: 'wpm' | 'accuracy',
): Point[] {
  return selected.map(({ number, attempt }) => ({
    number,
    value: attempt[metric],
  }))
}
