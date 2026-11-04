import { act, renderHook } from '@testing-library/react'
import { useTypingSession } from './useTypingSession'

let now = 0
beforeEach(() => {
  now = 0
  vi.spyOn(Date, 'now').mockImplementation(() => now)
})
afterEach(() => {
  vi.restoreAllMocks()
})

test('typing updates input value and session', () => {
  const { result } = renderHook(() => useTypingSession('hej'))

  act(() => result.current.handleChange('h'))
  act(() => result.current.handleChange('hx'))

  expect(result.current.inputValue).toBe('hx')
  expect(result.current.session.errors).toBe(1)
  expect(result.current.charStates).toEqual(['correct', 'incorrect', 'current'])
  expect(result.current.stats).toBeNull()
})

test('stats are available once finished, using the finish time', () => {
  const { result } = renderHook(() => useTypingSession('abcdefghij'))

  act(() => result.current.handleChange('a'))
  now = 12_000
  act(() => result.current.handleChange('abcdefghij'))
  now = 99_000

  expect(result.current.stats).toMatchObject({
    wpm: 10,
    accuracy: 100,
    elapsedMs: 12_000,
  })
})

test('restart clears everything', () => {
  const { result } = renderHook(() => useTypingSession('hej'))
  act(() => result.current.handleChange('hej'))

  act(() => result.current.restart())

  expect(result.current.inputValue).toBe('')
  expect(result.current.session.keystrokes).toBe(0)
  expect(result.current.session.finishedAt).toBeNull()
  expect(result.current.stats).toBeNull()
})

test('half-composed dead-key input is not scored until composition ends', () => {
  const { result } = renderHook(() => useTypingSession('café'))
  act(() => result.current.handleChange('caf'))

  act(() => result.current.compositionStart())
  act(() => result.current.handleChange('caf´'))

  expect(result.current.inputValue).toBe('caf´') // shown in the input as-is
  expect(result.current.session.typed).toBe('caf') // but not scored
  expect(result.current.session.errors).toBe(0)

  act(() => result.current.compositionEnd('café'))

  expect(result.current.session.typed).toBe('café')
  expect(result.current.session.errors).toBe(0)
  expect(result.current.session.keystrokes).toBe(4)
})

test('a new target text starts a fresh session', () => {
  const { result, rerender } = renderHook(
    ({ text }) => useTypingSession(text),
    { initialProps: { text: 'hej' } },
  )
  act(() => result.current.handleChange('he'))

  rerender({ text: 'tja' })

  expect(result.current.session.target).toBe('tja')
  expect(result.current.inputValue).toBe('')
})
