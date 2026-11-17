export type Finger =
  'lp' | 'lr' | 'lm' | 'li' | 'ri' | 'rm' | 'rr' | 'rp' | 'thumb'

export interface KeyDef {
  id: string
  label: string
  finger: Finger
  width?: number
}

const FINGER_KEYS: Record<Finger, string[]> = {
  lp: ['§', '1', 'q', 'a', 'z', '<', 'Tab', 'CapsLock', 'ShiftLeft'],
  lr: ['2', 'w', 's', 'x'],
  lm: ['3', 'e', 'd', 'c'],
  li: ['4', '5', 'r', 't', 'f', 'g', 'v', 'b'],
  ri: ['6', '7', 'y', 'u', 'h', 'j', 'n', 'm'],
  rm: ['8', 'i', 'k', ','],
  rr: ['9', 'o', 'l', '.'],
  rp: [
    '0',
    '+',
    '´',
    'p',
    'å',
    '¨',
    'ö',
    'ä',
    "'",
    '-',
    'Backspace',
    'ShiftRight',
  ],
  thumb: ['Space'],
}

const FINGER_BY_ID = new Map<string, Finger>(
  (Object.entries(FINGER_KEYS) as [Finger, string[]][]).flatMap(([f, ids]) =>
    ids.map((id) => [id, f] as [string, Finger]),
  ),
)

const SPECIAL_LABELS: Record<string, string> = {
  Backspace: '⌫',
  Tab: '⇥',
  CapsLock: '⇪',
  ShiftLeft: '⇧',
  ShiftRight: '⇧',
  Space: '',
}

const SPECIAL_WIDTHS: Record<string, number> = {
  Backspace: 2,
  Tab: 1.5,
  CapsLock: 1.75,
  ShiftLeft: 1.25,
  ShiftRight: 2.75,
  Space: 6,
}

function row(ids: string[]): KeyDef[] {
  return ids.map((id) => {
    const key: KeyDef = {
      id,
      label: SPECIAL_LABELS[id] ?? id,
      finger: FINGER_BY_ID.get(id)!,
    }
    if (SPECIAL_WIDTHS[id]) key.width = SPECIAL_WIDTHS[id]
    return key
  })
}

export const ROWS: readonly (readonly KeyDef[])[] = [
  row([...'§1234567890+´'.split(''), 'Backspace']),
  row(['Tab', ...'qwertyuiopå¨'.split('')]),
  row(['CapsLock', ..."asdfghjklöä'".split('')]),
  row(['ShiftLeft', ...'<zxcvbnm,.-'.split(''), 'ShiftRight']),
  row(['Space']),
]

const SHIFTED: Record<string, string> = {
  '!': '1',
  '"': '2',
  '#': '3',
  '%': '5',
  '&': '6',
  '/': '7',
  '(': '8',
  ')': '9',
  '=': '0',
  '?': '+',
  ';': ',',
  ':': '.',
  _: '-',
  '*': "'",
  '>': '<',
}

// Dead-key letters: press the dead key, then the base letter.
const ACCENTED: Record<string, [string, string]> = {}
for (const [composed, dead, base] of [
  ['áéíóúý', '´', 'aeiouy'],
  ['ëïü', '¨', 'eiu'],
] as const) {
  ;[...composed].forEach((c, i) => {
    ACCENTED[c] = [dead, base[i]!]
    ACCENTED[c.toUpperCase()] = [dead, base[i]!]
  })
}

function shiftFor(keyId: string): string {
  const finger = FINGER_BY_ID.get(keyId)
  return finger && finger.startsWith('l') ? 'ShiftRight' : 'ShiftLeft'
}

export function keysFor(ch: string): string[] {
  if (ch === ' ') return ['Space']
  if (FINGER_BY_ID.has(ch) && ch.length === 1) return [ch]
  const shifted = SHIFTED[ch]
  if (shifted) return [shifted, shiftFor(shifted)]
  const lower = ch.toLowerCase()
  if (lower !== ch && lower.length === 1 && FINGER_BY_ID.has(lower))
    return [lower, shiftFor(lower)]
  const accent = ACCENTED[ch]
  if (accent) {
    const [dead, base] = accent
    return ch === ch.toLowerCase() ? [dead, base] : [dead, shiftFor(base), base]
  }
  return []
}

export function fingerOf(id: string): Finger | undefined {
  return FINGER_BY_ID.get(id)
}
