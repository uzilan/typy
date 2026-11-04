import { useState } from 'react'
import { ThemeToggle } from '../theme/ThemeToggle'
import styles from './SignInScreen.module.css'

interface Props {
  onSignIn: () => Promise<void>
}

export function SignInScreen({ onSignIn }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    setError(null)
    setBusy(true)
    try {
      await onSignIn()
    } catch (e) {
      const code = (e as { code?: string }).code
      // Closing the Google window yourself is not an error.
      if (
        code !== 'auth/popup-closed-by-user' &&
        code !== 'auth/cancelled-popup-request'
      ) {
        setError('Inloggningen misslyckades. Försök igen.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.toggle}>
        <ThemeToggle />
      </div>
      <main className={styles.card}>
        <h1 className={styles.title}>Typy</h1>
        <p className={styles.text}>
          Öva på att skriva snabbare och säkrare med texter ur svensk
          litteratur. Logga in för att spara dina resultat.
        </p>
        <button
          type="button"
          className={styles.button}
          onClick={handleClick}
          disabled={busy}
        >
          Logga in med Google
        </button>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </main>
    </div>
  )
}
