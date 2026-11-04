/** Formats milliseconds as m:ss, rounding down to whole seconds. */
export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000)
  const seconds = String(total % 60).padStart(2, '0')
  return `${Math.floor(total / 60)}:${seconds}`
}
