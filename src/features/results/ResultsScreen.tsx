import { useEffect, useState } from 'react'
import type { Attempt } from '../../storage/attempt'
import { useAttemptStore } from '../../storage/AttemptStoreContext'
import { formatDuration } from '../typing/formatDuration'
import { hardChars, summarize } from './summary'
import styles from './ResultsScreen.module.css'

interface Props {
  exerciseId: string
  attemptId: string
  level: string
  title: string
  text: string
  onRetry: () => void
}

const dateFormat = new Intl.DateTimeFormat('sv-SE', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function ResultsScreen({
  exerciseId,
  attemptId,
  level,
  title,
  text,
  onRetry,
}: Props) {
  const store = useAttemptStore()
  const [attempts, setAttempts] = useState<Attempt[] | null>(null)

  useEffect(() => {
    let active = true
    void store.listByExercise(exerciseId).then((list) => {
      if (active) setAttempts(list)
    })
    return () => {
      active = false
    }
  }, [store, exerciseId])

  if (attempts === null) return <p className={styles.loading}>Laddar…</p>

  const { current, attemptNumber, isBest, rows } = summarize(
    attempts,
    attemptId,
  )
  const errorPositions = new Set(current.errorPositions)
  const toPractice = hardChars(current.missesByChar)

  return (
    <div className={styles.screen}>
      <p className={styles.crumb}>
        {level} · {title}
      </p>

      <section className={styles.summary}>
        <h1 className={styles.title}>Klart!</h1>
        <p className={styles.stats} data-testid="stats">
          <span>
            <strong>{current.wpm}</strong> ord/min
          </span>
          <span>
            <strong>{current.accuracy} %</strong> precision
          </span>
          <span>
            <strong>{formatDuration(current.elapsedMs)}</strong> tid
          </span>
          <span>
            <strong>{current.errors}</strong> fel
          </span>
        </p>
        <p className={styles.note}>
          Försök {attemptNumber} av den här övningen
          {isBest && ' · ditt bästa hittills'}
        </p>
      </section>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onRetry}>
          Försök igen
        </button>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.h2}>Där det gick fel</h2>
          <span className={styles.hint}>
            Markerade tecken skrev du fel (även om du rättade dem)
          </span>
        </div>
        <p className={styles.text}>
          {[...text].map((ch, i) =>
            errorPositions.has(i) ? (
              <span key={i} data-error className={styles.error}>
                {ch === ' ' ? '·' : ch}
              </span>
            ) : (
              <span key={i}>{ch}</span>
            ),
          )}
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2} id="practice-heading">
          Tecken att öva på
        </h2>
        {toPractice.length === 0 ? (
          <p className={styles.hint}>Inga fel – snyggt!</p>
        ) : (
          <ul className={styles.chips} aria-labelledby="practice-heading">
            {toPractice.map(({ char, count }) => (
              <li key={char} className={styles.chip}>
                <span className={styles.chipKey}>
                  {char === ' ' ? '␣' : char}
                </span>
                <span className={styles.chipLabel}>
                  {char === ' ' ? 'mellanslag, ' : ''}
                  {count} fel
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.h2} id="attempts-heading">
          Alla försök på övningen
        </h2>
        <div className={styles.tableWrap}>
          <table className={styles.table} aria-labelledby="attempts-heading">
            <thead>
              <tr>
                <th>Försök</th>
                <th>Datum</th>
                <th className={styles.wpmCol}>Ord/min</th>
                <th>Precision</th>
                <th>Tid</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ attempt, number, isCurrent, isBest, barPct }) => (
                <tr
                  key={attempt.id}
                  className={isCurrent ? styles.currentRow : undefined}
                >
                  <td>
                    {number}
                    {(isCurrent || isBest) && (
                      <span className={styles.tag}>
                        {[isCurrent && 'NU', isBest && 'BÄST']
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    )}
                  </td>
                  <td>{dateFormat.format(attempt.finishedAt)}</td>
                  <td>
                    <span className={styles.wpmCell}>
                      <span className={styles.wpmValue}>{attempt.wpm}</span>
                      <span className={styles.barTrack}>
                        <span
                          className={
                            isCurrent ? styles.barCurrent : styles.barFill
                          }
                          style={{ width: `${barPct}%` }}
                        />
                      </span>
                    </span>
                  </td>
                  <td>{attempt.accuracy} %</td>
                  <td>{formatDuration(attempt.elapsedMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
