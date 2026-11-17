import { WORDS } from './words'

test('only lowercase Swedish letters', () => {
  for (const w of WORDS) expect(w).toMatch(/^[a-zåäö]+$/)
})
test('no duplicates', () => {
  expect(new Set(WORDS).size).toBe(WORDS.length)
})
test('large enough and starts with easy words', () => {
  expect(WORDS.length).toBeGreaterThan(5000)
  expect(WORDS.slice(0, 200)).toContain('jag')
})
