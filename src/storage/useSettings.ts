import { useContext } from 'react'
import { SettingsContext, type SettingsValue } from './SettingsContext'

/** The user's settings (null while loading) and an updater; needs a SettingsProvider. */
export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext)
  if (!value) throw new Error('useSettings needs a SettingsProvider')
  return value
}
