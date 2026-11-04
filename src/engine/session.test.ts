import {
  applyInput,
  createSession,
  getCharStates,
  getStats,
  type Session,
} from './session'

/** Types `value` (the full input content) at time `now`. */
function type(session: Session, value: string, now = 0): Session {
  return applyInput(session, value, now)
}

/** Types `text` one character at a time, all at time `now`. */
function typeChars(session: Session, text: string, now = 0): Session {
  let s = session
  for (let i = 1; i <= text.length; i++) s = type(s, text.slice(0, i), now)
  return s
}

describe('createSession', () => {
  test('starts empty and not started', () => {
    const s = createSession('hej')

    expect(s.target).toBe('hej')
    expect(s.typed).toBe('')
    expect(s.startedAt).toBeNull()
    expect(s.finishedAt).toBeNull()
    expect(s.keystrokes).toBe(0)
    expect(s.errors).toBe(0)
    expect(s.errorPositions.size).toBe(0)
    expect(s.missesByChar).toEqual({})
  })

  test('normalizes the target to NFC', () => {
    const decomposed = 'ä' // a + combining diaeresis
    expect(createSession(decomposed).target).toBe('ä')
  })
})

describe('typing', () => {
  test('correct characters count as keystrokes without errors', () => {
    const s = typeChars(createSession('hej då'), 'hej')

    expect(s.typed).toBe('hej')
    expect(s.keystrokes).toBe(3)
    expect(s.errors).toBe(0)
  })

  test('a wrong character is an error recorded by position and expected char', () => {
    const s = typeChars(createSession('räv'), 'rav')

    expect(s.keystrokes).toBe(3)
    expect(s.errors).toBe(1)
    expect([...s.errorPositions]).toEqual([1])
    expect(s.missesByChar).toEqual({ ä: 1 })
  })

  test('pasting several characters counts each one', () => {
    const s = type(createSession('hej då'), 'hej xå')

    expect(s.keystrokes).toBe(6)
    expect(s.errors).toBe(1)
    expect([...s.errorPositions]).toEqual([4])
    expect(s.missesByChar).toEqual({ d: 1 })
  })

  test('a wrong space is recorded under the space character', () => {
    const s = typeChars(createSession('a b'), 'ax')

    expect(s.missesByChar).toEqual({ ' ': 1 })
  })
})

describe('deleting and correcting', () => {
  test('backspace is not a keystroke and keeps error history', () => {
    let s = typeChars(createSession('räv'), 'ra')
    s = type(s, 'r')

    expect(s.typed).toBe('r')
    expect(s.keystrokes).toBe(2)
    expect(s.errors).toBe(1)
    expect([...s.errorPositions]).toEqual([1])
  })

  test('a corrected error still counts against accuracy', () => {
    let s = typeChars(createSession('räv'), 'ra')
    s = type(s, 'r')
    s = typeChars(s, 'räv')

    expect(s.typed).toBe('räv')
    expect(s.keystrokes).toBe(4)
    expect(s.errors).toBe(1)
    expect([...s.errorPositions]).toEqual([1])
  })

  test('the same position missed twice is counted twice but stored once', () => {
    let s = typeChars(createSession('räv'), 'ra')
    s = type(s, 'r')
    s = type(s, 'rö')

    expect(s.errors).toBe(2)
    expect(s.missesByChar).toEqual({ ä: 2 })
    expect([...s.errorPositions]).toEqual([1])
  })

  test('editing in the middle treats everything after the edit as new', () => {
    let s = typeChars(createSession('hejsan'), 'hxj')
    s = type(s, 'hej') // caret moved back, x replaced by e

    expect(s.typed).toBe('hej')
    expect(s.keystrokes).toBe(5) // h, x, j, then e, j again
    expect(s.errors).toBe(1)
  })
})

describe('input edge cases', () => {
  test('input beyond the target length is cut off', () => {
    const s = type(createSession('hej'), 'hejsan')

    expect(s.typed).toBe('hej')
    expect(s.keystrokes).toBe(3)
  })

  test('decomposed input matches a precomposed target', () => {
    const s = type(createSession('sjön'), 'sjön')

    expect(s.typed).toBe('sjön')
    expect(s.errors).toBe(0)
    expect(s.keystrokes).toBe(4)
  })

  test('typing the same value again changes nothing', () => {
    const s1 = typeChars(createSession('hej'), 'he', 100)
    const s2 = type(s1, 'he', 200)

    expect(s2).toBe(s1)
  })
})

describe('timing and finishing', () => {
  test('the clock starts at the first character', () => {
    let s = type(createSession('hej'), '', 50)
    expect(s.startedAt).toBeNull()

    s = type(s, 'h', 100)
    s = type(s, 'he', 300)
    expect(s.startedAt).toBe(100)
  })

  test('finishes when typed length reaches target length, even with errors', () => {
    let s = typeChars(createSession('hej'), 'hex', 1000)
    expect(s.finishedAt).toBe(1000)

    s = typeChars(createSession('hej'), 'he', 500)
    expect(s.finishedAt).toBeNull()
  })

  test('input after finishing is ignored', () => {
    const done = type(createSession('hej'), 'hej', 1000)
    const after = type(done, 'he', 2000)

    expect(after).toBe(done)
  })
})

describe('getStats', () => {
  test('nothing typed: zero speed, full accuracy', () => {
    expect(getStats(createSession('hej'), 1000)).toEqual({
      wpm: 0,
      accuracy: 100,
      elapsedMs: 0,
      correctChars: 0,
      errors: 0,
    })
  })

  test('wpm is correct characters / 5 per minute', () => {
    // 10 correct chars in 12 s = 2 words in 0.2 min = 10 wpm
    let s = type(createSession('abcdefghij'), 'a', 0)
    s = type(s, 'abcdefghij', 12_000)

    const stats = getStats(s, 99_999)
    expect(stats.elapsedMs).toBe(12_000)
    expect(stats.correctChars).toBe(10)
    expect(stats.wpm).toBe(10)
  })

  test('wrong characters do not count toward wpm', () => {
    let s = type(createSession('abcdefghij'), 'a', 0)
    s = type(s, 'abcdeXXXXX', 12_000)

    expect(getStats(s, 12_000).wpm).toBe(5)
  })

  test('while running, elapsed time uses now', () => {
    const s = type(createSession('abcdefghij'), 'a', 1000)

    expect(getStats(s, 4000).elapsedMs).toBe(3000)
  })

  test('accuracy includes corrected errors and is rounded', () => {
    let s = typeChars(createSession('räv'), 'ra')
    s = type(s, 'r')
    s = typeChars(s, 'räv') // 4 keystrokes, 1 error → 75 %

    expect(getStats(s, 0).accuracy).toBe(75)

    const t = typeChars(createSession('abcdef'), 'abX') // 3 keystrokes, 1 error → 66.7 %
    expect(getStats(t, 0).accuracy).toBe(67)
  })
})

describe('getCharStates', () => {
  test('marks correct, incorrect, current and pending characters', () => {
    const s = typeChars(createSession('räven'), 'ra')

    expect(getCharStates(s)).toEqual([
      'correct',
      'incorrect',
      'current',
      'pending',
      'pending',
    ])
  })

  test('no current character once finished', () => {
    const s = type(createSession('hej'), 'hej')

    expect(getCharStates(s)).toEqual(['correct', 'correct', 'correct'])
  })

  test('first character is current before typing', () => {
    expect(getCharStates(createSession('hej'))).toEqual([
      'current',
      'pending',
      'pending',
    ])
  })
})
