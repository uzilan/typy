import { TypingScreen } from './features/typing/TypingScreen'
import { ThemeToggle } from './theme/ThemeToggle'
import styles from './App.module.css'

// Hard-coded until exercises arrive in phase 5.
const EXERCISE = {
  level: 'Nivå 3 · Meningar',
  title: 'Räven vid sjön',
  text: 'Det var en gång en räv som bodde vid sjön. Varje morgon gick han ner till stranden för att dricka av det kalla vattnet.',
}

function App() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logo}>Typy</span>
        <ThemeToggle />
      </header>
      <main>
        <TypingScreen {...EXERCISE} />
      </main>
    </div>
  )
}

export default App
