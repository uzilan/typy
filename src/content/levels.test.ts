import { findExercise, LEVELS } from './levels'

// Characters reachable on a Swedish keyboard (letters incl. dead-key é/ü).
const TYPEABLE = /^[A-Za-zÅÄÖåäöÉéÜü0-9 .,;:!?"'()\-/&%=+*<>§@#]+$/

const exercises = LEVELS.flatMap((l) => l.exercises)

test('levels numbered 0–5', () => {
  expect(LEVELS.map((l) => l.number)).toEqual([0, 1, 2, 3, 4, 5])
})

test('levels 1–5 have five exercises, level 0 has eleven', () => {
  for (const level of LEVELS.filter((l) => l.number >= 1))
    expect(level.exercises.length).toBe(5)
  expect(LEVELS[0]!.exercises.length).toBe(11)
})

test('level 0 exercises carry their allowed keys', () => {
  expect(new Set(findExercise('tangenter-1')?.allowedKeys)).toEqual(
    new Set(' asdfjklö'),
  )
  expect(findExercise('tangenter-1')?.title).toBe('Grundraden: a s d f j k l ö')
  expect(findExercise('tangenter-4')?.title).toBe('Nya tangenter: r u')
  expect(findExercise('tangenter-7')?.title).toBe('Nya tangenter: v c , .')
  expect(findExercise('tangenter-11')?.title).toBe('Stor bokstav: ⇧')
})

test('every exercise has non-empty, typeable text', () => {
  for (const e of exercises) {
    expect(e.text.length, e.id).toBeGreaterThan(10)
    expect(e.text, e.id).toMatch(TYPEABLE)
  }
})

test('exercise ids are unique', () => {
  const ids = exercises.map((e) => e.id)
  expect(new Set(ids).size).toBe(ids.length)
})

test('every exercise knows its level', () => {
  for (const level of LEVELS) {
    for (const e of level.exercises) expect(e.levelNumber).toBe(level.number)
  }
})

test('only the long-text level quotes literature', () => {
  for (const level of LEVELS) {
    for (const e of level.exercises) {
      if (level.number === 5) expect(e.source?.author, e.id).toBeTruthy()
      else expect(e.source, e.id).toBeUndefined()
    }
  }
})

const words = (text: string) => text.split(' ')

test('drill levels are lowercase words without punctuation', () => {
  for (const level of LEVELS.filter((l) => l.number >= 1 && l.number <= 2)) {
    for (const e of level.exercises)
      expect(e.text, e.id).toMatch(/^[a-zåäö ]+$/)
  }
})

test('level 1 uses only short words', () => {
  for (const e of LEVELS[1]!.exercises) {
    for (const w of words(e.text))
      expect(w.length, `${e.id}: ${w}`).toBeLessThanOrEqual(5)
  }
})

test('level 2 is rich in long words', () => {
  for (const e of LEVELS[2]!.exercises) {
    const long = words(e.text).filter((w) => w.length >= 8)
    expect(long.length, e.id).toBeGreaterThanOrEqual(8)
  }
})

test('findExercise looks up by id', () => {
  const first = exercises[0]!
  expect(findExercise(first.id)).toBe(first)
  expect(findExercise('nope')).toBeUndefined()
})
