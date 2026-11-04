import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

// Read from .env (not in git; see .env.example). The values end up in the
// built JS anyway; access is controlled by Auth and firestore.rules.
function env(name: string): string {
  const value = import.meta.env[name] as string | undefined
  if (!value) throw new Error(`Missing ${name} (copy .env.example to .env)`)
  return value
}

const firebaseConfig = {
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('VITE_FIREBASE_APP_ID'),
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Local development against emulators: VITE_USE_EMULATORS=true npm run dev
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
