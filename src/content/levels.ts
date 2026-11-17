import { plainSentences, punctuatedSentences } from './generate'
import { LESSONS, allowedChars, lessonText } from './beginner/lessons'
import { normalizeText } from './normalizeText'
import { PASSAGES, type Passage, type Source } from './passages'

export interface Exercise {
  id: string
  levelNumber: number
  title: string
  text: string
  source?: Source
  /** Level 0 only: the characters the learner may be asked to type. */
  allowedKeys?: string
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
    description:
      'Enkla meningar med korta ord, utan stor bokstav och skiljetecken.',
    slug: 'korta-ord',
    passageIds: ['katten', 'frukost', 'parken', 'regn', 'taget'],
    build: (t) => t,
  },
  {
    number: 2,
    name: 'Långa ord',
    description: 'Meningar fulla av långa och sammansatta ord.',
    slug: 'langa-ord',
    passageIds: [
      'kontoret',
      'tradgarden',
      'semestern',
      'biblioteket',
      'vintern',
    ],
    build: (t) => t,
  },
  {
    number: 3,
    name: 'Meningar',
    description: 'Hela meningar med stor bokstav, komma och punkt.',
    slug: 'meningar',
    passageIds: ['bussen', 'stugan', 'svamp', 'flytten', 'snon'],
    build: (t) => plainSentences(t, 3),
  },
  {
    number: 4,
    name: 'Skiljetecken och dialog',
    description: 'Repliker, frågor och utrop.',
    slug: 'dialog',
    passageIds: ['nycklarna', 'samtalet', 'restaurangen', 'cykeln', 'matchen'],
    build: (t) => punctuatedSentences(t, 3),
  },
  {
    number: 5,
    name: 'Längre texter',
    description: 'Hela stycken ur klassiska böcker.',
    slug: 'stycken',
    passageIds: ['varvader', 'lydia', 'middagen', 'sparvagnen', 'humlan'],
    build: (t) => t,
  },
]

function passage(id: string): Passage {
  const p = PASSAGES.find((p) => p.id === id)
  if (!p) throw new Error(`Unknown passage ${id}`)
  return p
}

const LEVEL_0: Level = {
  number: 0,
  name: 'Lär dig tangenterna',
  description:
    'Hitta rätt finger för varje tangent, några i taget. Orden kommer från Kelly-listan (Språkbanken, CC BY 4.0).',
  exercises: LESSONS.map((lesson) => ({
    id: `tangenter-${lesson.number}`,
    levelNumber: 0,
    title: `${lesson.name ?? 'Nya tangenter'}: ${
      lesson.newKeys === '' ? '⇧' : [...lesson.newKeys].join(' ')
    }`,
    text: lessonText(lesson.number),
    allowedKeys: allowedChars(lesson.number),
  })),
}

export const LEVELS: Level[] = [LEVEL_0, ...SPECS.map((spec) => ({
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
}))]

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
