import { createContext, useContext } from 'react'
import type { SettingsStore } from './SettingsStore'

export const SettingsStoreContext = createContext<SettingsStore | null>(null)

export function useSettingsStore(): SettingsStore {
  const store = useContext(SettingsStoreContext)
  if (!store) throw new Error('useSettingsStore needs a SettingsStoreContext')
  return store
}
