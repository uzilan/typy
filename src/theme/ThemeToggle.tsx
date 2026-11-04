import { useTheme } from './useTheme'
import styles from './ThemeToggle.module.css'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const label = theme === 'dark' ? 'Byt till ljust tema' : 'Byt till mörkt tema'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}
