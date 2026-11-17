import { allowedChars, EXCLUDED_WORDS, LESSONS, lessonText } from './lessons'

test('eleven lessons in the agreed order', () => {
  expect(LESSONS.map((l) => l.newKeys)).toEqual([
    'asdfjklö',
    'ghä',
    'ei',
    'ru',
    'to',
    'nm',
    'vc,.',
    'på',
    'by',
    'wxzq',
    '',
  ])
})
test('every lesson only uses allowed characters', () => {
  for (const l of LESSONS) {
    const allowed = new Set(allowedChars(l.number))
    for (const ch of lessonText(l.number))
      expect(allowed.has(ch), `${l.number}: ${ch}`).toBe(true)
  }
})
test('every lesson practises each of its new keys', () => {
  for (const l of LESSONS)
    for (const k of l.newKeys) expect(lessonText(l.number)).toContain(k)
})
test('lesson 11 has capital letters', () => {
  expect(lessonText(11)).toMatch(/[A-ZÅÄÖ]/)
})
test('lessons before 7 have no punctuation or capitals', () => {
  for (let n = 1; n < 7; n++) expect(lessonText(n)).toMatch(/^[a-zåäö ]+$/)
})
test('texts are a reasonable length', () => {
  for (const l of LESSONS) {
    expect(lessonText(l.number).length).toBeGreaterThanOrEqual(60)
    expect(lessonText(l.number).length).toBeLessThanOrEqual(200)
  }
})
test('deterministic', () => {
  expect(lessonText(3)).toBe(lessonText(3))
})
test('no double or edge spaces', () => {
  for (const l of LESSONS)
    expect(lessonText(l.number)).toBe(
      lessonText(l.number).trim().replace(/ +/g, ' '),
    )
})
test('no lesson contains an excluded word', () => {
  for (const l of LESSONS) {
    const words = lessonText(l.number)
      .toLowerCase()
      .replace(/[,.]/g, '')
      .split(' ')
    for (const w of words)
      expect(EXCLUDED_WORDS.has(w), `${l.number}: ${w}`).toBe(false)
  }
})

test('lesson 11 capitalises only the first word of each sentence', () => {
  const words = lessonText(11).split(' ')
  const capitalised = words.filter((w) => /^[A-ZÅÄÖ]/.test(w))
  expect(capitalised.length).toBeGreaterThanOrEqual(3)
  words.forEach((w, i) => {
    if (/^[A-ZÅÄÖ]/.test(w))
      expect(i === 0 || words[i - 1]!.endsWith('.')).toBe(true)
  })
})
