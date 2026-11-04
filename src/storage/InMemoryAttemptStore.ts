import type { Attempt, NewAttempt } from './attempt'
import type { AttemptStore } from './AttemptStore'

/** Keeps attempts in memory; lost on page reload. Stand-in until Firebase. */
export class InMemoryAttemptStore implements AttemptStore {
  private attempts: Attempt[] = []

  async add(attempt: NewAttempt): Promise<Attempt> {
    const saved: Attempt = { ...attempt, id: crypto.randomUUID() }
    this.attempts.push(saved)
    return saved
  }

  async listByExercise(exerciseId: string): Promise<Attempt[]> {
    return newestFirst(this.attempts.filter((a) => a.exerciseId === exerciseId))
  }

  async listAll(): Promise<Attempt[]> {
    return newestFirst(this.attempts)
  }
}

function newestFirst(attempts: Attempt[]): Attempt[] {
  return [...attempts].sort((a, b) => b.finishedAt - a.finishedAt)
}
