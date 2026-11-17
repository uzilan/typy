import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { SettingsContext } from './SettingsContext'
import type { UserSettings } from './SettingsStore'
import { useSettingsStore } from './SettingsStoreContext'

/**
 * Loads the user's settings once and shares them with the whole tree. Needs a
 * SettingsStoreContext above it. `update` applies locally at once and persists
 * in the background; an update made while loading wins over the loaded value.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const store = useSettingsStore()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const pending = useRef<Partial<UserSettings>>({})

  useEffect(() => {
    let active = true
    pending.current = {}
    store
      .get()
      .then((loaded) => {
        if (active) setSettings({ ...loaded, ...pending.current })
      })
      .catch((err: unknown) => {
        console.error('Could not load settings', err)
        if (active) setSettings({ skippedLevel0: false, ...pending.current })
      })
    return () => {
      active = false
    }
  }, [store])

  const update = useCallback(
    (patch: Partial<UserSettings>) => {
      pending.current = { ...pending.current, ...patch }
      setSettings((current) => (current ? { ...current, ...patch } : current))
      // Keep the optimistic value if the write fails; just report it.
      store.update(patch).catch((err: unknown) => {
        console.error('Could not save settings', err)
      })
    },
    [store],
  )

  return (
    <SettingsContext value={{ settings, update }}>{children}</SettingsContext>
  )
}
