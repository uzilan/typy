import { useState } from 'react'
import { Link } from 'react-router'
import { findExercise } from '../../content/levels'
import { useAllAttempts } from '../../storage/useAllAttempts'
import { LineChart, niceScale } from './LineChart'
import {
  progressSummary,
  RECENT_COUNT,
  selectRange,
  series,
  type Range,
} from './progressStats'
import styles from './ProgressScreen.module.css'

const RANGES: { value: Range; label: string }[] = [
  { value: 'recent', label: `Senaste ${RECENT_COUNT} försöken` },
  { value: 'all', label: 'Alla' },
]

export function ProgressScreen() {
  const attempts = useAllAttempts()
  const [range, setRange] = useState<Range>('recent')

  if (attempts === null) return <p className={styles.muted}>Laddar…</p>

  const heading = <h1 className={styles.title}>Mina framsteg</h1>

  if (attempts.length === 0) {
    return (
      <div className={styles.screen}>
        {heading}
        <p className={styles.muted}>Inga försök än.</p>
        <p>
          <Link to="/">Till övningarna</Link>
        </p>
      </div>
    )
  }

  const selected = selectRange(attempts, range)
  const summary = progressSummary(selected)
  const wpm = series(selected, 'wpm')
  const accuracy = series(selected, 'accuracy')
  const bestTitle = summary.best
    ? (findExercise(summary.best.exerciseId)?.title ?? '')
    : ''

  return (
    <div className={styles.screen}>
      <div className={styles.head}>
        {heading}
        <div className={styles.ranges} role="group" aria-label="Urval">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              className={styles.range}
              aria-pressed={r.value === range}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tiles}>
        <Tile
          label="Bästa ord/min"
          value={summary.best?.wpm ?? 0}
          sub={bestTitle}
        />
        <Tile label="Snitt ord/min" value={summary.avgWpm} />
        <Tile label="Snitt precision" value={`${summary.avgAccuracy} %`} />
        <Tile label="Antal försök" value={summary.attempts} />
      </div>

      <LineChart
        title="Ord per minut"
        unit="ord/min"
        points={wpm}
        scale={niceScale(
          wpm.map((p) => p.value),
          { zeroBased: true },
        )}
      />
      <LineChart
        title="Precision"
        unit="%"
        points={accuracy}
        scale={niceScale(
          accuracy.map((p) => p.value),
          { zeroBased: false, max: 100 },
        )}
      />
    </div>
  )
}

function Tile({
  label,
  value,
  sub,
}: {
  label: string
  value: number | string
  sub?: string
}) {
  return (
    <div className={styles.tile}>
      <span className={styles.tileLabel}>{label}</span>
      <span className={styles.tileValue}>{value}</span>
      {sub && <span className={styles.tileSub}>{sub}</span>}
    </div>
  )
}
