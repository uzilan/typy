import { describe, expect, test } from 'vitest'
import { LEVELS } from '../../content/levels'
import { fingerOf, keysFor, ROWS } from './layout'

describe('keysFor', () => {
  test('maps plain keys, space and shifted characters', () => {
    expect(keysFor('j')).toEqual(['j'])
    expect(keysFor(' ')).toEqual(['Space'])
    expect(keysFor('A').sort()).toEqual(['ShiftRight', 'a'].sort())
    expect(keysFor('Ö').sort()).toEqual(['ShiftLeft', 'ö'].sort())
    expect(keysFor('?').sort()).toEqual(['+', 'ShiftLeft'].sort())
    expect(keysFor('"').sort()).toEqual(['2', 'ShiftRight'].sort())
    expect(keysFor(':').sort()).toEqual(['.', 'ShiftLeft'].sort())
  })

  test('maps dead-key letters', () => {
    expect(keysFor('é')).toEqual(['´', 'e'])
    expect(keysFor('É').sort()).toEqual(['´', 'ShiftRight', 'e'].sort())
    expect(keysFor('ü')).toEqual(['¨', 'u'])
  })

  test('returns [] for unknown characters', () => {
    expect(keysFor('\n')).toEqual([])
  })

  test('every character used in any exercise maps to at least one key', () => {
    for (const e of LEVELS.flatMap((l) => l.exercises))
      for (const ch of e.text)
        expect(
          keysFor(ch).length,
          `${e.id}: ${JSON.stringify(ch)}`,
        ).toBeGreaterThan(0)
  })
})

describe('fingerOf', () => {
  test('returns the finger for a key id', () => {
    expect(fingerOf('f')).toBe('li')
    expect(fingerOf('ö')).toBe('rp')
    expect(fingerOf('Space')).toBe('thumb')
    expect(fingerOf('nope')).toBeUndefined()
  })
})

test('all rows except the space row are equally wide', () => {
  const widths = ROWS.slice(0, -1).map((r) =>
    r.reduce((sum, k) => sum + (k.width ?? 1), 0),
  )
  expect(new Set(widths).size).toBe(1)
})
