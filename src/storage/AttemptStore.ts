import type { Attempt, NewAttempt } from './attempt'

/**
 * Where finished attempts are kept. Async so a remote backend (Firebase)
 * can implement it without changing callers.
 */
export interface AttemptStore {
  add(attempt: NewAttempt): Promise<Attempt>
  /** Attempts at one exercise, newest first. */
  listByExercise(exerciseId: string): Promise<Attempt[]>
  /** All attempts, newest first. */
  listAll(): Promise<Attempt[]>
}
