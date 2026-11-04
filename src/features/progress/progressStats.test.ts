import type { Attempt } from '../../storage/attempt'
import { progressSummary, selectRange, series } from './progressStats'

function attempt(
  finishedAt: number,
  wpm: number,
  accuracy: number,
  exerciseId = 'ex',
): Attempt {
  return {
    id: String(finishedAt),
    exerciseId,
    finishedAt,
    wpm,
    accuracy,
    elapsedMs: 1000,
    errors: 0,
    keystrokes: 10,
    errorPositions: [],
    missesByChar: {},
  }
}

describe('selectRange', () => {
  const many = Array.from({ length: 25 }, (_, i) => attempt(i + 1, 20 + i, 90))

  test('all: every attempt, oldest first, numbered from 1', () => {
    const selected = selectRange([...many].reverse(), 'all')

    expect(selected).toHaveLength(25)
    expect(selected[0]).toMatchObject({ number: 1, attempt: { finishedAt: 1 } })
    expect(selected[24]).toMatchObject({ number: 25 })
  })

  test('recent: the last 20, keeping their overall numbers', () => {
    const selected = selectRange(many, 'recent')

    expect(selected).toHaveLength(20)
    expect(selected[0]?.number).toBe(6)
    expect(selected[19]?.number).toBe(25)
  })
})

describe('progressSummary', () => {
  test('best, averages and count', () => {
    const selected = selectRange(
      [
        attempt(1, 20, 90, 'a'),
        attempt(2, 34, 97, 'b'),
        attempt(3, 30, 95, 'a'),
      ],
      'all',
    )

    expect(progressSummary(selected)).toEqual({
      attempts: 3,
      best: { wpm: 34, exerciseId: 'b' },
      avgWpm: 28,
      avgAccuracy: 94,
    })
  })

  test('a tie keeps the earlier best', () => {
    const selected = selectRange(
      [attempt(1, 30, 90, 'a'), attempt(2, 30, 90, 'b')],
      'all',
    )

    expect(progressSummary(selected).best?.exerciseId).toBe('a')
  })

  test('empty', () => {
    expect(progressSummary([])).toEqual({
      attempts: 0,
      best: null,
      avgWpm: 0,
      avgAccuracy: 0,
    })
  })
})

describe('series', () => {
  test('one point per attempt for the chosen metric', () => {
    const selected = selectRange(
      [attempt(1, 20, 90), attempt(2, 25, 95)],
      'all',
    )

    expect(series(selected, 'wpm')).toEqual([
      { number: 1, value: 20 },
      { number: 2, value: 25 },
    ])
    expect(series(selected, 'accuracy').map((p) => p.value)).toEqual([90, 95])
  })
})
