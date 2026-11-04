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

/** Level 1 is always open; level N opens when every level before it is complete. */
export function isUnlocked(
  levelNumber: number,
  levels: Level[],
  attempts: Attempt[],
): boolean {
  const tried = triedIds(attempts)
  return levels
    .filter((l) => l.number < levelNumber)
    .every((l) => isComplete(l, tried))
}

export function levelProgress(
  levels: Level[],
  attempts: Attempt[],
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
    const status: LevelStatus = !isUnlocked(level.number, levels, attempts)
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
): Exercise | null {
  const all = levels.flatMap((l) => l.exercises)
  const index = all.findIndex((e) => e.id === currentId)
  const next = index < 0 ? undefined : all[index + 1]
  if (!next) return null
  return isUnlocked(next.levelNumber, levels, attempts) ? next : null
}
