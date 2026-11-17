import {
  LEVELS as REAL_LEVELS,
  type Exercise,
  type Level,
} from '../../content/levels'
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
  test('a level opens when every exercise in the previous one was tried', () => {
    expect(isUnlocked(2, LEVELS, [tried('a')], false)).toBe(false)
    expect(isUnlocked(2, LEVELS, [tried('a'), tried('b')], false)).toBe(true)
  })

  test('levels must open in order', () => {
    // Level 2 done but level 1 not: level 2 and 3 stay locked.
    const attempts = [tried('a'), tried('c'), tried('d')]
    expect(isUnlocked(2, LEVELS, attempts, false)).toBe(false)
    expect(isUnlocked(3, LEVELS, attempts, false)).toBe(false)
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

    const [l1, l2, l3] = levelProgress(LEVELS, attempts, false)

    expect(l1?.status).toBe('done')
    expect(l1?.done).toBe(2)
    expect(l1?.exercises[0]).toMatchObject({ tries: 2 })
    expect(l1?.exercises[0]?.best).toMatchObject({ wpm: 30, accuracy: 85 })
    expect(l2?.status).toBe('in-progress')
    expect(l2?.exercises[1]).toMatchObject({ tries: 0, best: null })
    expect(l3?.status).toBe('locked')
  })

  test('nothing tried: level 1 in progress, rest locked', () => {
    expect(levelProgress(LEVELS, [], false).map((l) => l.status)).toEqual([
      'in-progress',
      'locked',
      'locked',
    ])
  })
})

describe('nextExercise', () => {
  test('next exercise in the same level', () => {
    expect(nextExercise('a', LEVELS, [tried('a')], false)?.id).toBe('b')
  })

  test('first exercise of the next level once it is unlocked', () => {
    expect(nextExercise('b', LEVELS, [tried('a'), tried('b')], false)?.id).toBe(
      'c',
    )
  })

  test('none when the next level is still locked', () => {
    expect(nextExercise('b', LEVELS, [tried('b')], false)).toBeNull()
  })

  test('none after the very last exercise', () => {
    expect(nextExercise('e', LEVELS, [], false)).toBeNull()
  })
})

describe('unlock rule with the real levels', () => {
  const level0 = REAL_LEVELS[0]!.exercises
  const level1 = REAL_LEVELS[1]!.exercises
  const level2 = REAL_LEVELS[2]!.exercises

  test('level 0 is open and level 1 locked for a new user', () => {
    expect(isUnlocked(0, REAL_LEVELS, [], false)).toBe(true)
    expect(isUnlocked(1, REAL_LEVELS, [], false)).toBe(false)
  })

  test('level 1 opens when every level 0 exercise was tried', () => {
    const partial = level0.slice(1).map((e) => tried(e.id))
    expect(isUnlocked(1, REAL_LEVELS, partial, false)).toBe(false)
    const all = level0.map((e) => tried(e.id))
    expect(isUnlocked(1, REAL_LEVELS, all, false)).toBe(true)
  })

  test('level 1 opens when level 0 was skipped', () => {
    expect(isUnlocked(1, REAL_LEVELS, [], true)).toBe(true)
  })

  test('level 1 opens for existing users with an attempt on a later level', () => {
    expect(isUnlocked(1, REAL_LEVELS, [tried('meningar-bussen')], false)).toBe(
      true,
    )
  })

  test('level 2 opens from level 1 alone, without any level 0 attempts', () => {
    const attempts = level1.map((e) => tried(e.id))
    expect(isUnlocked(2, REAL_LEVELS, attempts, false)).toBe(true)
  })

  test('level 3 stays locked while level 2 is incomplete, even with level 0 done', () => {
    const attempts = [...level0, ...level1, level2[0]!].map((e) => tried(e.id))
    expect(isUnlocked(3, REAL_LEVELS, attempts, false)).toBe(false)
  })

  test('the exercise after level 0 is the first of level 1 once level 0 is complete', () => {
    const attempts = level0.map((e) => tried(e.id))
    expect(nextExercise('tangenter-11', REAL_LEVELS, attempts, false)?.id).toBe(
      level1[0]!.id,
    )
    expect(nextExercise('tangenter-11', REAL_LEVELS, [], false)).toBeNull()
  })
})
