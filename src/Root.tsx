import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { useMemo } from 'react'
import App from './App'
import { SignInScreen } from './auth/SignInScreen'
import { useAuthUser } from './auth/useAuthUser'
import { auth, db } from './firebase/app'
import { FirestoreAttemptStore } from './storage/FirestoreAttemptStore'

/** Sign-in gate: the app is only shown to a signed-in user, with their own store. */
export function Root() {
  const user = useAuthUser(auth)
  const uid = user?.uid
  const store = useMemo(
    () => (uid ? new FirestoreAttemptStore(db, uid) : null),
    [uid],
  )

  if (user === undefined) return null // restoring the session; brief
  if (!store) {
    return (
      <SignInScreen
        onSignIn={async () => {
          await signInWithPopup(auth, new GoogleAuthProvider())
        }}
      />
    )
  }
  return <App store={store} onSignOut={() => signOut(auth)} />
}
