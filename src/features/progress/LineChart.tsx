import { useId } from 'react'
import type { Point } from './progressStats'
import styles from './LineChart.module.css'

export interface Scale {
  min: number
  max: number
  step: number
}

/**
 * A readable y-scale. zeroBased: 0 to the next ten above the data (at least
 * 40). Otherwise: from a round number below the data up to `max`.
 */
export function niceScale(
  values: number[],
  opts: { zeroBased: true } | { zeroBased: false; max: number },
): Scale {
  const hi = Math.max(...values, 0)
  if (opts.zeroBased) {
    const step = niceStep(Math.max(hi, 40) / 4)
    return { min: 0, max: Math.max(40, Math.ceil(hi / step) * step), step }
  }
  const lo = Math.min(...values, opts.max)
  const step = opts.max - lo > 20 ? 10 : 5
  const min = Math.max(
    0,
    Math.min(opts.max - 4 * step, Math.floor(lo / step) * step),
  )
  return { min, max: opts.max, step }
}

/** Smallest of 10, 20, 50, 100, 200, 500, … that is ≥ raw. */
function niceStep(raw: number): number {
  for (let magnitude = 10; ; magnitude *= 10) {
    for (const m of [1, 2, 5]) if (m * magnitude >= raw) return m * magnitude
  }
}

interface Props {
  title: string
  unit: string
  points: Point[]
  scale: Scale
}

/** Single-series line chart: one y-axis, hover titles, a hidden data table. */
export function LineChart({ title, unit, points, scale }: Props) {
  const titleId = useId()
  const { min, max, step } = scale
  const y = (v: number) => 100 - (100 * (v - min)) / (max - min)
  const x = (i: number) =>
    points.length === 1 ? 50 : (100 * i) / (points.length - 1)

  const ticks: number[] = []
  for (let v = min; v <= max; v += step) ticks.push(v)

  const coords = points.map((p, i) => ({ ...p, x: x(i), y: y(p.value) }))
  const first = points[0]
  const last = points[points.length - 1]

  return (
    <figure className={styles.figure} aria-labelledby={titleId}>
      <figcaption id={titleId} className={styles.title}>
        {title}
      </figcaption>

      <div className={styles.chart} aria-hidden="true">
        <div className={styles.yAxis}>
          {ticks.map((v) => (
            <span key={v} className={styles.tick} style={{ top: `${y(v)}%` }}>
              {v}
            </span>
          ))}
        </div>
        <div className={styles.plot}>
          {ticks.map((v) => (
            <div
              key={v}
              className={v === min ? styles.baseline : styles.gridline}
              style={{ top: `${y(v)}%` }}
            />
          ))}
          <svg
            className={styles.svg}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polyline
              points={coords.map((c) => `${c.x},${c.y}`).join(' ')}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {coords.map((c) => (
            <span
              key={c.number}
              className={styles.hit}
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
              title={`Försök ${c.number}: ${c.value} ${unit}`}
            >
              <span className={styles.dot} />
            </span>
          ))}
        </div>
      </div>

      {first && last && (
        <div className={styles.xAxis} aria-hidden="true">
          <span>Försök {first.number}</span>
          {last !== first && <span>Försök {last.number}</span>}
        </div>
      )}

      <table className={styles.srOnly}>
        <thead>
          <tr>
            <th>Försök</th>
            <th>{unit}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.number}>
              <td>{p.number}</td>
              <td>{p.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
