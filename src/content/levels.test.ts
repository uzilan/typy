import { findExercise, LEVELS } from './levels'

// Characters reachable on a Swedish keyboard (letters incl. dead-key é/ü).
const TYPEABLE = /^[A-Za-zÅÄÖåäöÉéÜü0-9 .,;:!?"'()\-/&%=+*<>§@#]+$/

const exercises = LEVELS.flatMap((l) => l.exercises)

test('five levels numbered 1–5', () => {
  expect(LEVELS.map((l) => l.number)).toEqual([1, 2, 3, 4, 5])
})

test('every level has five exercises', () => {
  for (const level of LEVELS) expect(level.exercises.length).toBe(5)
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
  for (const level of LEVELS.filter((l) => l.number <= 2)) {
    for (const e of level.exercises)
      expect(e.text, e.id).toMatch(/^[a-zåäö ]+$/)
  }
})

test('level 1 uses only short words', () => {
  for (const e of LEVELS[0]!.exercises) {
    for (const w of words(e.text))
      expect(w.length, `${e.id}: ${w}`).toBeLessThanOrEqual(5)
  }
})

test('level 2 is rich in long words', () => {
  for (const e of LEVELS[1]!.exercises) {
    const long = words(e.text).filter((w) => w.length >= 8)
    expect(long.length, e.id).toBeGreaterThanOrEqual(8)
  }
})

test('findExercise looks up by id', () => {
  const first = exercises[0]!
  expect(findExercise(first.id)).toBe(first)
  expect(findExercise('nope')).toBeUndefined()
})
