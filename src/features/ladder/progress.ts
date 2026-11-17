import type { Exercise, Level } from '../../content/levels'
import type { Attempt } from '../../storage/attempt'

export interface ExerciseProgress {
  exercise: Exercise
  tries: number
  /** Highest-WPM attempt (earliest on a tie), or null if never tried. */
  best: Attempt | null
}

export type LevelStatus = 'done' | 'in-progress' | 'locked'

export interface LevelProgress {
  level: Level
  status: LevelStatus
  /** Exercises tried at least once. */
  done: number
  exercises: ExerciseProgress[]
}

function triedIds(attempts: Attempt[]): Set<string> {
  return new Set(attempts.map((a) => a.exerciseId))
}

function isComplete(level: Level, tried: Set<string>): boolean {
  return level.exercises.every((e) => tried.has(e.id))
}

/**
 * Level 0 is always open. Level 1 opens once level 0 was tried, was skipped, or
 * the user already has attempts on a later level. Level N >= 2 opens when every
 * level 1..N-1 is complete (level 0 never counts).
 */
export function isUnlocked(
  levelNumber: number,
  levels: Level[],
  attempts: Attempt[],
  skippedLevel0: boolean,
): boolean {
  if (levelNumber <= 0) return true
  const tried = triedIds(attempts)
  if (levelNumber === 1) {
    return (
      skippedLevel0 ||
      levels.filter((l) => l.number === 0).every((l) => isComplete(l, tried)) ||
      levels.some(
        (l) => l.number >= 1 && l.exercises.some((e) => tried.has(e.id)),
      )
    )
  }
  return levels
    .filter((l) => l.number >= 1 && l.number < levelNumber)
    .every((l) => isComplete(l, tried))
}

export function levelProgress(
  levels: Level[],
  attempts: Attempt[],
  skippedLevel0: boolean,
): LevelProgress[] {
  const tried = triedIds(attempts)
  return levels.map((level) => {
    const exercises = level.exercises.map((exercise) => {
      const own = attempts
        .filter((a) => a.exerciseId === exercise.id)
        .sort((a, b) => a.finishedAt - b.finishedAt)
      let best: Attempt | null = null
      for (const a of own) if (!best || a.wpm > best.wpm) best = a
      return { exercise, tries: own.length, best }
    })
    const status: LevelStatus = !isUnlocked(
      level.number,
      levels,
      attempts,
      skippedLevel0,
    )
      ? 'locked'
      : isComplete(level, tried)
        ? 'done'
        : 'in-progress'
    return {
      level,
      status,
      done: exercises.filter((e) => e.tries > 0).length,
      exercises,
    }
  })
}

/** The exercise after `currentId`: next in its level, else first of the next level if unlocked. */
export function nextExercise(
  currentId: string,
  levels: Level[],
  attempts: Attempt[],
  skippedLevel0: boolean,
): Exercise | null {
  const all = levels.flatMap((l) => l.exercises)
  const index = all.findIndex((e) => e.id === currentId)
  const next = index < 0 ? undefined : all[index + 1]
  if (!next) return null
  return isUnlocked(next.levelNumber, levels, attempts, skippedLevel0)
    ? next
    : null
}
