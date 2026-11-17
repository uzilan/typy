import { useCallback, useEffect, useState } from 'react'
import type { UserSettings } from './SettingsStore'
import { useSettingsStore } from './SettingsStoreContext'

/**
 * The user's settings, loaded on mount; null while loading. `update` applies
 * locally at once and persists in the background.
 */
export function useSettings(): {
  settings: UserSettings | null
  update: (patch: Partial<UserSettings>) => void
} {
  const store = useSettingsStore()
  const [settings, setSettings] = useState<UserSettings | null>(null)

  useEffect(() => {
    let active = true
    void store.get().then((loaded) => {
      if (active) setSettings(loaded)
    })
    return () => {
      active = false
    }
  }, [store])

  const update = useCallback(
    (patch: Partial<UserSettings>) => {
      setSettings((current) => (current ? { ...current, ...patch } : current))
      // Keep the optimistic value if the write fails; just report it.
      store.update(patch).catch((err: unknown) => {
        console.error('Could not save settings', err)
      })
    },
    [store],
  )

  return { settings, update }
}
