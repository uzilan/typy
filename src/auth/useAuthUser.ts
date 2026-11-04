import { onAuthStateChanged, type Auth, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'

/** undefined while Firebase restores the session, then the user or null. */
export function useAuthUser(auth: Auth): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  useEffect(() => onAuthStateChanged(auth, setUser), [auth])
  return user
}
