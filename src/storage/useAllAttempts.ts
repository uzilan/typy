import { useEffect, useState } from 'react'
import type { Attempt } from './attempt'
import { useAttemptStore } from './AttemptStoreContext'

/** All attempts, loaded on mount; null while loading. */
export function useAllAttempts(): Attempt[] | null {
  const store = useAttemptStore()
  const [attempts, setAttempts] = useState<Attempt[] | null>(null)

  useEffect(() => {
    let active = true
    void store.listAll().then((list) => {
      if (active) setAttempts(list)
    })
    return () => {
      active = false
    }
  }, [store])

  return attempts
}
