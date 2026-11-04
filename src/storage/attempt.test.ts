import { applyInput, createSession } from '../engine/session'
import { toAttempt } from './attempt'

test('builds an attempt from a finished session', () => {
  let s = createSession('räven')
  s = applyInput(s, 'r', 1000)
  s = applyInput(s, 'ra', 1000) // error at 1 (ä)
  s = applyInput(s, 'r', 1000)
  s = applyInput(s, 'räven', 13_000) // done: 5 correct chars in 12 s

  expect(toAttempt(s, 'ex-1')).toEqual({
    exerciseId: 'ex-1',
    finishedAt: 13_000,
    wpm: 5,
    accuracy: 83, // 6 keystrokes, 1 error
    elapsedMs: 12_000,
    errors: 1,
    keystrokes: 6,
    errorPositions: [1],
    missesByChar: { ä: 1 },
  })
})

test('error positions are sorted', () => {
  let s = createSession('abcd')
  s = applyInput(s, 'abX', 0) // error at 2
  s = applyInput(s, 'a', 0)
  s = applyInput(s, 'aXcd', 0) // error at 1, added after 2

  expect(toAttempt(s, 'ex').errorPositions).toEqual([1, 2])
})

test('refuses an unfinished session', () => {
  const s = applyInput(createSession('hej'), 'h', 0)

  expect(() => toAttempt(s, 'ex-1')).toThrow('not finished')
})
