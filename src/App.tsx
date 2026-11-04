import { Route, Routes } from 'react-router'
import { LadderScreen } from './features/ladder/LadderScreen'
import { ExerciseRoute } from './features/routes/ExerciseRoute'
import { NotFound } from './features/routes/NotFound'
import { ResultsRoute } from './features/routes/ResultsRoute'
import { AttemptStoreContext } from './storage/AttemptStoreContext'
import type { AttemptStore } from './storage/AttemptStore'
import { InMemoryAttemptStore } from './storage/InMemoryAttemptStore'
import { ThemeToggle } from './theme/ThemeToggle'
import styles from './App.module.css'

// In memory until Firebase (phase 9): attempts are lost on reload.
const defaultStore = new InMemoryAttemptStore()

/** Expects to be rendered inside a router (BrowserRouter in main.tsx). */
function App({ store = defaultStore }: { store?: AttemptStore }) {
  return (
    <AttemptStoreContext value={store}>
      <div className={styles.page}>
        <header className={styles.header}>
          <ThemeToggle />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<LadderScreen />} />
            <Route path="/ovning/:id" element={<ExerciseRoute />} />
            <Route
              path="/ovning/:id/resultat/:attemptId"
              element={<ResultsRoute />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </AttemptStoreContext>
  )
}

export default App
