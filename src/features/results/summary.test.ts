import type { Attempt } from '../../storage/attempt'
import { hardChars, summarize } from './summary'

function attempt(id: string, finishedAt: number, wpm: number): Attempt {
  return {
    id,
    exerciseId: 'ex',
    finishedAt,
    wpm,
    accuracy: 95,
    elapsedMs: 30_000,
    errors: 1,
    keystrokes: 100,
    errorPositions: [],
    missesByChar: {},
  }
}

describe('summarize', () => {
  const a1 = attempt('a1', 100, 20)
  const a2 = attempt('a2', 200, 30)
  const a3 = attempt('a3', 300, 25)

  test('numbers attempts chronologically, rows newest first', () => {
    const s = summarize([a1, a3, a2], 'a3')

    expect(s.attemptNumber).toBe(3)
    expect(s.rows.map((r) => [r.attempt.id, r.number])).toEqual([
      ['a3', 3],
      ['a2', 2],
      ['a1', 1],
    ])
  })

  test('marks current and best rows', () => {
    const s = summarize([a1, a2, a3], 'a3')

    expect(s.isBest).toBe(false)
    expect(s.rows.map((r) => [r.attempt.id, r.isCurrent, r.isBest])).toEqual([
      ['a3', true, false],
      ['a2', false, true],
      ['a1', false, false],
    ])
  })

  test('a new record is the best', () => {
    const s = summarize([a1, a2, attempt('a4', 400, 31)], 'a4')

    expect(s.isBest).toBe(true)
  })

  test('a tie does not take the record from the earlier attempt', () => {
    const s = summarize([a1, a2, attempt('a4', 400, 30)], 'a4')

    expect(s.isBest).toBe(false)
    expect(s.rows.find((r) => r.isBest)?.attempt.id).toBe('a2')
  })

  test('the only attempt is the best', () => {
    const s = summarize([a1], 'a1')

    expect(s.attemptNumber).toBe(1)
    expect(s.isBest).toBe(true)
  })

  test('bar widths are relative to the fastest attempt', () => {
    const s = summarize([a1, a2, a3], 'a3')

    expect(s.rows.map((r) => r.barPct)).toEqual([83, 100, 67])
  })

  test('bar widths are zero when every attempt is 0 wpm', () => {
    const s = summarize([attempt('z', 1, 0)], 'z')

    expect(s.rows[0]?.barPct).toBe(0)
  })

  test('throws when the current attempt is missing', () => {
    expect(() => summarize([a1], 'nope')).toThrow()
  })
})

describe('hardChars', () => {
  test('sorts by misses, most first, then alphabetically', () => {
    expect(hardChars({ t: 1, ä: 3, g: 1, ö: 2 })).toEqual([
      { char: 'ä', count: 3 },
      { char: 'ö', count: 2 },
      { char: 'g', count: 1 },
      { char: 't', count: 1 },
    ])
  })

  test('empty when no misses', () => {
    expect(hardChars({})).toEqual([])
  })
})
