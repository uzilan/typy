import { Link } from 'react-router'
import { LEVELS } from '../../content/levels'
import { useAllAttempts } from '../../storage/useAllAttempts'
import { levelProgress, type LevelStatus } from './progress'
import styles from './LadderScreen.module.css'

const STATUS_LABEL: Record<LevelStatus, string> = {
  done: 'Klar',
  'in-progress': 'Pågår',
  locked: 'Låst',
}

const DOT_CLASS: Record<LevelStatus, string | undefined> = {
  done: styles.dotDone,
  'in-progress': styles.dotActive,
  locked: undefined,
}

export function LadderScreen() {
  const attempts = useAllAttempts()
  if (attempts === null) return <p className={styles.muted}>Laddar…</p>

  const progress = levelProgress(LEVELS, attempts)

  return (
    <div className={styles.screen}>
      <div>
        <h1 className={styles.title}>Övningar</h1>
        <p className={styles.muted}>
          Gör alla övningar på en nivå för att låsa upp nästa.
        </p>
      </div>

      <ol className={styles.ladder}>
        {progress.map(({ level, status, done, exercises }, i) => {
          const headingId = `level-${level.number}`
          const last = i === progress.length - 1
          return (
            <li key={level.number} className={styles.step}>
              <div className={styles.rail} aria-hidden="true">
                <span className={`${styles.dot} ${DOT_CLASS[status]}`}>
                  {level.number}
                </span>
                {!last && <span className={styles.line} />}
              </div>

              <section className={styles.level} aria-labelledby={headingId}>
                <div className={styles.levelHead}>
                  <h2 id={headingId} className={styles.levelName}>
                    {level.name}
                  </h2>
                  <span className={styles.muted}>
                    {status === 'locked'
                      ? STATUS_LABEL.locked
                      : `${STATUS_LABEL[status]} · ${done}/${exercises.length}`}
                  </span>
                </div>
                <p className={styles.description}>{level.description}</p>

                {status === 'locked' ? (
                  <p className={styles.locked}>
                    <LockIcon />
                    {exercises.length} övningar · låses upp när nivå{' '}
                    {level.number - 1} är klar
                  </p>
                ) : (
                  <ul className={styles.exercises}>
                    {exercises.map(({ exercise, tries, best }) => (
                      <li key={exercise.id}>
                        <Link
                          to={`/ovning/${exercise.id}`}
                          className={styles.exercise}
                        >
                          <span
                            className={`${styles.check} ${tries > 0 ? styles.checked : ''}`}
                            aria-hidden="true"
                          >
                            {tries > 0 && <CheckIcon />}
                          </span>
                          <span className={styles.exerciseName}>
                            {exercise.title}
                          </span>
                          <span className={styles.meta}>
                            {best
                              ? `${best.wpm} ord/min · ${best.accuracy} %`
                              : 'Inte påbörjad'}
                          </span>
                          <ChevronIcon />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12l5 5L20 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      className={styles.chevron}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </g>
    </svg>
  )
}
