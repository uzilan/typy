import { NavLink, Route, Routes } from 'react-router'
import { LadderScreen } from './features/ladder/LadderScreen'
import { ProgressScreen } from './features/progress/ProgressScreen'
import { ExerciseRoute } from './features/routes/ExerciseRoute'
import { NotFound } from './features/routes/NotFound'
import { ResultsRoute } from './features/routes/ResultsRoute'
import { AttemptStoreContext } from './storage/AttemptStoreContext'
import type { AttemptStore } from './storage/AttemptStore'
import { ThemeToggle } from './theme/ThemeToggle'
import styles from './App.module.css'

interface Props {
  /** The signed-in user's attempts. */
  store: AttemptStore
  onSignOut?: () => void
}

/** The signed-in app. Expects a router around it (BrowserRouter in main.tsx). */
function App({ store, onSignOut }: Props) {
  return (
    <AttemptStoreContext value={store}>
      <div className={styles.page}>
        <header className={styles.header}>
          <nav className={styles.nav} aria-label="Huvudmeny">
            <NavLink to="/" end className={styles.navLink}>
              Övningar
            </NavLink>
            <NavLink to="/framsteg" className={styles.navLink}>
              Mina framsteg
            </NavLink>
          </nav>
          <div className={styles.actions}>
            {onSignOut && (
              <button
                type="button"
                className={styles.signOut}
                onClick={onSignOut}
              >
                Logga ut
              </button>
            )}
            <ThemeToggle />
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<LadderScreen />} />
            <Route path="/framsteg" element={<ProgressScreen />} />
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
