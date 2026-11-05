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

test('findExercise looks up by id', () => {
  const first = exercises[0]!
  expect(findExercise(first.id)).toBe(first)
  expect(findExercise('nope')).toBeUndefined()
})
