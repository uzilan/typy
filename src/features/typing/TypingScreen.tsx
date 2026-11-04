import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { formatDuration } from './formatDuration'
import { useTypingSession } from './useTypingSession'
import styles from './TypingScreen.module.css'

interface Props {
  level: string
  title: string
  text: string
}

export function TypingScreen({ level, title, text }: Props) {
  const {
    session,
    inputValue,
    charStates,
    stats,
    handleChange,
    compositionStart,
    compositionEnd,
    restart,
  } = useTypingSession(text)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const targetRef = useRef<HTMLParagraphElement>(null)
  const [round, setRound] = useState(0)
  const [rows, setRows] = useState(1)
  const done = stats !== null

  // Focus on mount and after each restart (once the input is enabled again).
  useEffect(() => {
    inputRef.current?.focus()
  }, [round])

  // Give the input as many lines as the target text wraps to.
  // Both share font, size, line height and content width, so lines break alike.
  useLayoutEffect(() => {
    const el = targetRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const measure = () => {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight)
      if (lineHeight > 0) {
        setRows(Math.max(1, Math.round(el.clientHeight / lineHeight)))
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function handleRestart() {
    restart()
    setRound((r) => r + 1)
  }

  const typedCount = session.typed.length
  const total = session.target.length

  return (
    <div className={styles.screen}>
      <p className={styles.crumb}>
        {level} · {title}
      </p>

      <div className={styles.card}>
        <p className={styles.target} ref={targetRef}>
          {[...session.target].map((ch, i) => {
            const state = charStates[i]
            return (
              <span key={i} data-state={state} className={styles[state ?? '']}>
                {state === 'incorrect' && ch === ' ' ? '·' : ch}
              </span>
            )
          })}
        </p>

        <div className={styles.field}>
          <label htmlFor="typing-input" className={styles.label}>
            Skriv texten ovan här
          </label>
          <textarea
            id="typing-input"
            ref={inputRef}
            className={styles.input}
            rows={rows}
            // Browsers size `rows` inconsistently (some ignore line-height),
            // so set the height explicitly: lines × line height + padding + border.
            style={{ height: `calc(${rows} * 1.8em + 32px)` }}
            value={inputValue}
            disabled={done}
            placeholder="Klicka här och börja skriva…"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault()
            }}
            onChange={(e) => handleChange(e.target.value)}
            onCompositionStart={compositionStart}
            onCompositionEnd={(e) => compositionEnd(e.currentTarget.value)}
          />
        </div>

        <div className={styles.progress}>
          <div
            className={styles.track}
            role="progressbar"
            aria-label="Framsteg"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={typedCount}
          >
            <div
              className={styles.fill}
              style={{ width: `${(100 * typedCount) / total}%` }}
            />
          </div>
          <span className={styles.count}>
            {typedCount} / {total} tecken
          </span>
        </div>
      </div>

      {stats && (
        <div className={styles.done} role="status">
          <div>
            <p className={styles.doneTitle}>Klart!</p>
            <p className={styles.doneStats}>
              {stats.wpm} ord per minut · {stats.accuracy} % precision ·{' '}
              {formatDuration(stats.elapsedMs)}
            </p>
          </div>
          <button type="button" className={styles.primary} disabled>
            Se resultat
          </button>
        </div>
      )}

      <div>
        <button
          type="button"
          className={styles.secondary}
          onClick={handleRestart}
        >
          Börja om
        </button>
      </div>
    </div>
  )
}
