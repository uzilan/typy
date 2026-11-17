import { initializeApp } from 'firebase/app'
import {
  connectAuthEmulator,
  getAuth,
  signInAnonymously,
  signOut,
} from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { FirestoreSettingsStore } from './FirestoreSettingsStore'
import { describeSettingsStore } from './settingsStoreContract'

// Runs against the local emulators (npm run test:emulator), with the real rules.
const app = initializeApp({ projectId: 'demo-typy', apiKey: 'demo-key' })
const auth = getAuth(app)
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
const db = getFirestore(app)
connectFirestoreEmulator(db, '127.0.0.1', 8080)

// A fresh signed-in user per store, so each one starts empty.
describeSettingsStore('FirestoreSettingsStore', async () => {
  await signOut(auth)
  const { user } = await signInAnonymously(auth)
  return new FirestoreSettingsStore(db, user.uid)
})
