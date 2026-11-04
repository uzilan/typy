import { TypingScreen } from './features/typing/TypingScreen'
import { AttemptStoreContext } from './storage/AttemptStoreContext'
import { InMemoryAttemptStore } from './storage/InMemoryAttemptStore'
import { ThemeToggle } from './theme/ThemeToggle'
import styles from './App.module.css'

// In memory until Firebase (phase 9): attempts are lost on reload.
const attemptStore = new InMemoryAttemptStore()

// Hard-coded until exercises arrive in phase 5.
const EXERCISE = {
  exerciseId: 'raven-vid-sjon',
  level: 'Nivå 3 · Meningar',
  title: 'Räven vid sjön',
  text: 'Det var en gång en räv som bodde vid sjön. Varje morgon gick han ner till stranden för att dricka av det kalla vattnet.',
}

function App() {
  return (
    <AttemptStoreContext value={attemptStore}>
      <div className={styles.page}>
        <header className={styles.header}>
          <span className={styles.logo}>Typy</span>
          <ThemeToggle />
        </header>
        <main>
          <TypingScreen {...EXERCISE} />
        </main>
      </div>
    </AttemptStoreContext>
  )
}

export default App
