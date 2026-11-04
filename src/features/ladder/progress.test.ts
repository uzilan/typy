import type { Exercise, Level } from '../../content/levels'
import type { Attempt } from '../../storage/attempt'
import { isUnlocked, levelProgress, nextExercise } from './progress'

const SOURCE = { author: 'A', work: 'W', year: 1906, url: '' }
function ex(id: string, levelNumber: number): Exercise {
  return { id, levelNumber, title: id, text: 'text', source: SOURCE }
}
const LEVELS: Level[] = [
  {
    number: 1,
    name: 'Ett',
    description: '',
    exercises: [ex('a', 1), ex('b', 1)],
  },
  {
    number: 2,
    name: 'Två',
    description: '',
    exercises: [ex('c', 2), ex('d', 2)],
  },
  { number: 3, name: 'Tre', description: '', exercises: [ex('e', 3)] },
]

let t = 0
function tried(exerciseId: string, wpm = 20, accuracy = 90): Attempt {
  return {
    id: `${exerciseId}-${++t}`,
    exerciseId,
    finishedAt: t,
    wpm,
    accuracy,
    elapsedMs: 1000,
    errors: 0,
    keystrokes: 10,
    errorPositions: [],
    missesByChar: {},
  }
}

describe('isUnlocked', () => {
  test('level 1 is always open', () => {
    expect(isUnlocked(1, LEVELS, [])).toBe(true)
  })

  test('a level opens when every exercise in the previous one was tried', () => {
    expect(isUnlocked(2, LEVELS, [tried('a')])).toBe(false)
    expect(isUnlocked(2, LEVELS, [tried('a'), tried('b')])).toBe(true)
  })

  test('levels must open in order', () => {
    // Level 2 done but level 1 not: level 2 and 3 stay locked.
    const attempts = [tried('a'), tried('c'), tried('d')]
    expect(isUnlocked(2, LEVELS, attempts)).toBe(false)
    expect(isUnlocked(3, LEVELS, attempts)).toBe(false)
  })
})

describe('levelProgress', () => {
  test('statuses and per-exercise bests', () => {
    const attempts = [
      tried('a', 20, 90),
      tried('a', 30, 85),
      tried('b', 25, 99),
      tried('c'),
    ]

    const [l1, l2, l3] = levelProgress(LEVELS, attempts)

    expect(l1?.status).toBe('done')
    expect(l1?.done).toBe(2)
    expect(l1?.exercises[0]).toMatchObject({ tries: 2 })
    expect(l1?.exercises[0]?.best).toMatchObject({ wpm: 30, accuracy: 85 })
    expect(l2?.status).toBe('in-progress')
    expect(l2?.exercises[1]).toMatchObject({ tries: 0, best: null })
    expect(l3?.status).toBe('locked')
  })

  test('nothing tried: level 1 in progress, rest locked', () => {
    expect(levelProgress(LEVELS, []).map((l) => l.status)).toEqual([
      'in-progress',
      'locked',
      'locked',
    ])
  })
})

describe('nextExercise', () => {
  test('next exercise in the same level', () => {
    expect(nextExercise('a', LEVELS, [tried('a')])?.id).toBe('b')
  })

  test('first exercise of the next level once it is unlocked', () => {
    expect(nextExercise('b', LEVELS, [tried('a'), tried('b')])?.id).toBe('c')
  })

  test('none when the next level is still locked', () => {
    expect(nextExercise('b', LEVELS, [tried('b')])).toBeNull()
  })

  test('none after the very last exercise', () => {
    expect(nextExercise('e', LEVELS, [])).toBeNull()
  })
})
