import { WORDS } from './words'

export interface Lesson {
  number: number
  name?: string
  newKeys: string
}

export const LESSONS: readonly Lesson[] = [
  { number: 1, name: 'Grundraden', newKeys: 'asdfjklö' },
  { number: 2, name: 'Mitten', newKeys: 'ghä' },
  { number: 3, name: 'Uppåt', newKeys: 'ei' },
  { number: 4, newKeys: 'ru' },
  { number: 5, newKeys: 'to' },
  { number: 6, name: 'Nedåt', newKeys: 'nm' },
  { number: 7, newKeys: 'vc,.' },
  { number: 8, newKeys: 'på' },
  { number: 9, newKeys: 'by' },
  { number: 10, name: 'Ovanliga', newKeys: 'wxzq' },
  { number: 11, name: 'Stor bokstav', newKeys: '' },
]

// Words never used in lesson texts: politically charged, violent, sexual, drug-related or otherwise sensitive.
export const EXCLUDED_WORDS: ReadonlySet<string> = new Set([
  'regering', 'ligga', 'lik', 'politisk', 'politik', 'parti', 'krig', 'riksdag', 'politiker',
  'kristen', 'död', 'brott', 'religion', 'jude', 'gud', 'sjuk', 'våld', 'president', 'muslim',
  'döda', 'kris', 'döma', 'religiös', 'vapen', 'sjukdom', 'skjuta', 'islam', 'judisk',
  'invandrare', 'muslimsk', 'sexuell', 'världskrig', 'fängelse', 'sex', 'sexa', 'sextio', 'sexton',
  'piratparti', 'vänsterparti', 'centerparti', 'politiskt', 'folkparti', 'miljöparti',
  'kristendom', 'flykting', 'helvete', 'terrorism', 'dum', 'rasism', 'alkohol', 'invandring',
  'republik', 'kommunistisk', 'kommunist', 'hata', 'terrorist', 'hat', 'mörda', 'homosexuell',
  'brottslighet', 'nazist', 'kommunism', 'våldsam', 'extrem', 'extremt', 'drog', 'öl', 'våldtäkt',
  'idiot', 'partiledare', 'gudomlig', 'finanskris', 'bomb', 'islamisk', 'slav', 'inbördeskrig',
  'abort', 'mördare', 'folkmord', 'illegal', 'naken', 'cancer', 'nazism', 'skita', 'kärnvapen',
  'tortyr', 'rasist', 'katolik', 'dödsstraff', 'stöld', 'fan', 'dödsfall', 'självmord', 'dumt',
  'sexualitet', 'brottsling', 'islamist', 'presidentval', 'dumhet', 'dödlig', 'riksdagsval',
  'marxism', 'sprit', 'fascism', 'gudstjänst', 'judendom', 'slaveri', 'krigare', 'exploatering',
  'nazistisk', 'explodera', 'bomba', 'våldta', 'islamistisk', 'rumpa', 'förövare', 'rån',
  'riksdagsman', 'hora', 'förbjuden', 'fascistisk', 'explosion', 'satan', 'extremist', 'bombning',
  'vapenvila', 'brottas', 'porr', 'miljöpolitik', 'arbetarparti', 'marxist', 'brottslig',
  'fascist', 'berusad', 'exploatera', 'terror', 'gudinna', 'kriga', 'sexig', 'gudom', 'odödlig',
  'explosiv', 'alkoholism', 'slavisk', 'narkoman', 'terroristisk', 'fördöma', 'dö',
])

const TARGET_LENGTH = 120
const POOL_SIZE = 40
const CAPITALS_LESSON = 11
const FIRST_PUNCTUATION_LESSON = 7
const LOWERCASE = /^[a-zåäö]$/

function lessonsUpTo(lessonNumber: number): readonly Lesson[] {
  return LESSONS.filter((l) => l.number <= lessonNumber)
}

export function allowedChars(lessonNumber: number): string {
  let chars = lessonsUpTo(lessonNumber).map((l) => l.newKeys).join('') + ' '
  if (lessonNumber >= FIRST_PUNCTUATION_LESSON) chars += ',.'
  if (lessonNumber >= CAPITALS_LESSON) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'
  return chars
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const tmp = result[i] as T
    result[i] = result[j] as T
    result[j] = tmp
  }
  return result
}

function drill(newKeys: string, lessonNumber: number): string[] {
  const letters = [...newKeys].filter((k) => LOWERCASE.test(k))
  const parts = letters.map((k) => k.repeat(3))
  if (lessonNumber === 1) {
    parts.push('fj', 'jf', 'dk', 'kd', 'sl', 'ls', 'aö', 'öa')
  } else {
    for (let i = 0; i + 1 < letters.length; i += 2) {
      const a = letters[i]
      const b = letters[i + 1]
      parts.push(`${a}${b}`, `${b}${a}`)
    }
  }
  return parts
}

function pickWords(lessonNumber: number, newKeys: string, startLength: number, random: () => number): string[] {
  const letters = new Set([...allowedChars(lessonNumber)].filter((c) => LOWERCASE.test(c)))
  const candidates = WORDS.filter((w) => w.length > 1 && !EXCLUDED_WORDS.has(w) && [...w].every((c) => letters.has(c)))
  const hasNew = (w: string) => [...newKeys].some((k) => w.includes(k))
  const ordered = [...candidates.filter(hasNew), ...candidates.filter((w) => !hasNew(w))]
  const mixed = [...shuffle(ordered.slice(0, POOL_SIZE), random), ...ordered.slice(POOL_SIZE)]

  const picked: string[] = []
  let length = startLength
  for (const word of mixed) {
    if (length >= TARGET_LENGTH) break
    picked.push(word)
    length += word.length + 1
  }
  return picked
}

// Groups words into short sentences: ends each with '.', puts a comma mid-sentence in longer ones.
function punctuate(words: string[], random: () => number): string[] {
  const result: string[] = []
  let i = 0
  while (i < words.length) {
    const size = Math.min(4 + Math.floor(random() * 4), words.length - i)
    const sentence = words.slice(i, i + size)
    if (size >= 5) {
      const at = 1 + Math.floor(random() * 2)
      sentence[at] += ','
    }
    sentence[size - 1] += '.'
    result.push(...sentence)
    i += size
  }
  return result
}

function capitalise(words: string[], random: () => number): string[] {
  return words.map((w, i) => {
    const startsSentence = i === 0 || words[i - 1]?.endsWith('.')
    return startsSentence || random() < 0.2 ? w.charAt(0).toUpperCase() + w.slice(1) : w
  })
}

export function lessonText(lessonNumber: number): string {
  const lesson = LESSONS.find((l) => l.number === lessonNumber)
  if (!lesson) throw new Error(`Unknown lesson ${lessonNumber}`)
  const random = mulberry32(lessonNumber)

  const drillParts = lessonNumber === CAPITALS_LESSON ? [] : drill(lesson.newKeys, lessonNumber)
  const drillLength = drillParts.join(' ').length + (drillParts.length > 0 ? 1 : 0)
  let words = pickWords(lessonNumber, lesson.newKeys, drillLength, random)
  if (lessonNumber >= FIRST_PUNCTUATION_LESSON) words = punctuate(words, random)
  if (lessonNumber === CAPITALS_LESSON) words = capitalise(words, random)
  return [...drillParts, ...words].join(' ')
}
