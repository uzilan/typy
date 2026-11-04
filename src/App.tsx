import { useState } from 'react'
import { LEVELS, type Exercise, type Level } from './content/levels'
import { ResultsScreen } from './features/results/ResultsScreen'
import { TypingScreen } from './features/typing/TypingScreen'
import { AttemptStoreContext } from './storage/AttemptStoreContext'
import { InMemoryAttemptStore } from './storage/InMemoryAttemptStore'
import { ThemeToggle } from './theme/ThemeToggle'
import styles from './App.module.css'

// In memory until Firebase (phase 9): attempts are lost on reload.
const attemptStore = new InMemoryAttemptStore()

// First exercise until the level ladder arrives (phase 5b).
const level = LEVELS[0] as Level
const exercise = level.exercises[0] as Exercise
const EXERCISE = {
  exerciseId: exercise.id,
  level: `Nivå ${level.number} · ${level.name}`,
  title: exercise.title,
  text: exercise.text,
}

// Simple screen state; a router comes when there are more screens (phase 5).
type View = { name: 'typing' } | { name: 'results'; attemptId: string }

function App() {
  const [view, setView] = useState<View>({ name: 'typing' })

  return (
    <AttemptStoreContext value={attemptStore}>
      <div className={styles.page}>
        <header className={styles.header}>
          <span className={styles.logo}>Typy</span>
          <ThemeToggle />
        </header>
        <main>
          {view.name === 'typing' ? (
            <TypingScreen
              {...EXERCISE}
              onShowResults={(attemptId) =>
                setView({ name: 'results', attemptId })
              }
            />
          ) : (
            <ResultsScreen
              {...EXERCISE}
              attemptId={view.attemptId}
              onRetry={() => setView({ name: 'typing' })}
            />
          )}
        </main>
      </div>
    </AttemptStoreContext>
  )
}

export default App
