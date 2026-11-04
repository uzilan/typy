import { createContext, useContext } from 'react'
import type { AttemptStore } from './AttemptStore'

export const AttemptStoreContext = createContext<AttemptStore | null>(null)

export function useAttemptStore(): AttemptStore {
  const store = useContext(AttemptStoreContext)
  if (!store) throw new Error('useAttemptStore needs an AttemptStoreContext')
  return store
}
