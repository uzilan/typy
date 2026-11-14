import { plainSentences, punctuatedSentences, splitSentences } from './generate'

const TEXT =
  'Det var en gång en pojke. Han tyckte om odygd och sömn. "Ja," sade pojken, "det kan jag." Var är fönsterbrädet? Han såg sig om; ingen fanns där.'

describe('splitSentences', () => {
  test('splits after . ? ! keeping closing quotes with the sentence', () => {
    expect(splitSentences(TEXT)).toEqual([
      'Det var en gång en pojke.',
      'Han tyckte om odygd och sömn.',
      '"Ja," sade pojken, "det kan jag."',
      'Var är fönsterbrädet?',
      'Han såg sig om; ingen fanns där.',
    ])
  })
})

describe('splitSentences inside quotes', () => {
  test('does not split inside a quotation', () => {
    expect(
      splitSentences('Han ropade: "Tititt! Se på Nils!" Sedan flög han. Slut.'),
    ).toEqual(['Han ropade: "Tititt! Se på Nils!"', 'Sedan flög han.', 'Slut.'])
  })
})

describe('plainSentences', () => {
  test('sentences without dialogue or special punctuation', () => {
    expect(plainSentences(TEXT, 3)).toBe(
      'Det var en gång en pojke. Han tyckte om odygd och sömn.',
    )
  })
})

describe('punctuatedSentences', () => {
  test('sentences with quotes, ? ! ; : or dashes', () => {
    expect(punctuatedSentences(TEXT, 2)).toBe(
      '"Ja," sade pojken, "det kan jag." Var är fönsterbrädet?',
    )
  })
})
