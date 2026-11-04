/**
 * Deterministic exercise text from a passage: the same passage always gives
 * the same text, so attempts at an exercise stay comparable.
 */

function uniqueWords(text: string): string[] {
  const words = (text.match(/[\p{L}]+/gu) ?? []).map((w) => w.toLowerCase())
  return [...new Set(words)]
}

/** Unique words of 2–5 letters, in order of appearance, lowercased. */
export function shortWords(text: string, max: number): string {
  return uniqueWords(text)
    .filter((w) => w.length >= 2 && w.length <= 5)
    .slice(0, max)
    .join(' ')
}

/** Unique words of 8 or more letters, in order of appearance, lowercased. */
export function longWords(text: string, max: number): string {
  return uniqueWords(text)
    .filter((w) => w.length >= 8)
    .slice(0, max)
    .join(' ')
}

/**
 * Splits after . ? ! (and a closing quote right after them), but never
 * inside a quotation, so dialogue stays whole.
 */
export function splitSentences(text: string): string[] {
  const sentences: string[] = []
  let start = 0
  let inQuote = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') inQuote = !inQuote
    const atEnd = i === text.length - 1 || text[i + 1] === ' '
    const endsSentence =
      ('.!?'.includes(ch as string) && !inQuote) ||
      (ch === '"' && !inQuote && '.!?'.includes(text[i - 1] as string))
    if (endsSentence && atEnd) {
      sentences.push(text.slice(start, i + 1).trim())
      start = i + 1
    }
  }
  const rest = text.slice(start).trim()
  if (rest) sentences.push(rest)
  return sentences
}

const SPECIAL = /["?!;:-]/

/** First `max` sentences without dialogue or special punctuation. */
export function plainSentences(text: string, max: number): string {
  return splitSentences(text)
    .filter((s) => !SPECIAL.test(s))
    .slice(0, max)
    .join(' ')
}

/** First `max` sentences with quotes, ? ! ; : or dashes. */
export function punctuatedSentences(text: string, max: number): string {
  return splitSentences(text)
    .filter((s) => SPECIAL.test(s))
    .slice(0, max)
    .join(' ')
}
