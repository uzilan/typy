import { createContext } from 'react'
import type { UserSettings } from './SettingsStore'

export interface SettingsValue {
  settings: UserSettings | null
  update: (patch: Partial<UserSettings>) => void
}

export const SettingsContext = createContext<SettingsValue | null>(null)
