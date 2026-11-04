import { normalizeText } from './normalizeText'

test.each([
  ['”Hej”, sade han.', '"Hej", sade han.'],
  ['“Hej” och „hej”', '"Hej" och "hej"'],
  ['det är Lydia’s', "det är Lydia's"],
  ['sig — hon', 'sig - hon'],
  ['1–2', '1-2'],
  ['och så…', 'och så...'],
  ['a b', 'a b'],
  ['  rad ett\nrad  två  ', 'rad ett rad två'],
  ['ä', 'ä'],
])('%j → %j', (input, expected) => {
  expect(normalizeText(input)).toBe(expected)
})
