import { useId } from 'react'
import type { Point } from './progressStats'
import type { Scale } from './scale'
import styles from './LineChart.module.css'

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
