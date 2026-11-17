import { fingerOf, keysFor, ROWS, type Finger } from './layout'
import styles from './Keyboard.module.css'

interface KeyboardProps {
  nextChar: string | undefined
  allowedKeys: string | undefined
}

const LEFT_HAND: Finger[] = ['lp', 'lr', 'lm', 'li', 'thumb']
const RIGHT_HAND: Finger[] = ['thumb', 'ri', 'rm', 'rr', 'rp']

export function Keyboard({ nextChar, allowedKeys }: KeyboardProps) {
  const nextKeys = new Set(nextChar ? keysFor(nextChar) : [])
  const activeFingers = new Set(
    [...nextKeys].map((id) => fingerOf(id)).filter(Boolean),
  )
  const neededKeys =
    allowedKeys === undefined
      ? undefined
      : new Set(['Backspace', ...[...allowedKeys].flatMap((c) => keysFor(c))])

  return (
    <div className={styles.keyboard} aria-hidden="true">
      {ROWS.map((row, i) => (
        <div key={i} className={styles.row}>
          {row.map((k) => (
            <div
              key={k.id}
              className={`${styles.key} ${k.id === 'f' || k.id === 'j' ? styles.bump : ''}`}
              style={{ flexGrow: k.width ?? 1 }}
              data-key={k.id}
              data-finger={k.finger}
              data-next={nextKeys.has(k.id)}
              data-dim={neededKeys !== undefined && !neededKeys.has(k.id)}
            >
              {k.label}
            </div>
          ))}
        </div>
      ))}
      <div className={styles.hands}>
        {[LEFT_HAND, RIGHT_HAND].map((fingers, h) => (
          <div key={h} className={styles.hand}>
            {fingers.map((f) => (
              <span
                key={f}
                className={`${styles.finger} ${styles[f]}`}
                data-finger={f}
                data-active={activeFingers.has(f)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
