export interface Scale {
  min: number
  max: number
  step: number
}

/**
 * A readable y-scale with about 4–5 ticks. zeroBased: from 0 up to a whole
 * step above the data (at least 40). Otherwise: from a round number below
 * the data up to `max`.
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
