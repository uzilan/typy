import {
  longWords,
  plainSentences,
  punctuatedSentences,
  shortWords,
} from './generate'
import { normalizeText } from './normalizeText'
import { PASSAGES, type Passage, type Source } from './passages'

export interface Exercise {
  id: string
  levelNumber: number
  title: string
  text: string
  source: Source
}

export interface Level {
  number: number
  name: string
  description: string
  exercises: Exercise[]
}

interface LevelSpec {
  number: number
  name: string
  description: string
  slug: string
  passageIds: string[]
  build: (text: string) => string
}

const SPECS: LevelSpec[] = [
  {
    number: 1,
    name: 'Korta ord',
    description: 'Korta ord på 2–5 bokstäver.',
    slug: 'korta-ord',
    passageIds: ['pojken', 'varvader', 'lydia'],
    build: (t) => shortWords(t, 20),
  },
  {
    number: 2,
    name: 'Långa ord',
    description: 'Långa och sammansatta ord.',
    slug: 'langa-ord',
    passageIds: ['varvader', 'spegeln', 'smirre'],
    build: (t) => longWords(t, 12),
  },
  {
    number: 3,
    name: 'Meningar',
    description: 'Hela meningar med stor bokstav, komma och punkt.',
    slug: 'meningar',
    passageIds: ['varvader', 'spegeln', 'lydia'],
    build: (t) => plainSentences(t, 3),
  },
  {
    number: 4,
    name: 'Skiljetecken och dialog',
    description: 'Repliker, frågor och utrop.',
    slug: 'dialog',
    passageIds: ['predikan', 'grasparven', 'smirre'],
    build: (t) => punctuatedSentences(t, 3),
  },
  {
    number: 5,
    name: 'Längre texter',
    description: 'Hela stycken ur böckerna.',
    slug: 'stycken',
    passageIds: ['pojken', 'loften', 'lydia'],
    build: (t) => t,
  },
]

function passage(id: string): Passage {
  const p = PASSAGES.find((p) => p.id === id)
  if (!p) throw new Error(`Unknown passage ${id}`)
  return p
}

export const LEVELS: Level[] = SPECS.map((spec) => ({
  number: spec.number,
  name: spec.name,
  description: spec.description,
  exercises: spec.passageIds.map((id) => {
    const p = passage(id)
    return {
      id: `${spec.slug}-${p.id}`,
      levelNumber: spec.number,
      title: p.title,
      text: spec.build(normalizeText(p.text)),
      source: p.source,
    }
  }),
}))

/** "Nivå 1 · Korta ord" */
export function levelLabel(levelNumber: number): string {
  const level = LEVELS.find((l) => l.number === levelNumber)
  return level ? `Nivå ${level.number} · ${level.name}` : `Nivå ${levelNumber}`
}

export function findExercise(id: string): Exercise | undefined {
  for (const level of LEVELS) {
    const e = level.exercises.find((e) => e.id === id)
    if (e) return e
  }
  return undefined
}
