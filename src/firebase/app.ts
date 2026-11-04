import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

// Web config is not secret; access is controlled by Auth and firestore.rules.
const firebaseConfig = {
  apiKey: 'REMOVED',
  authDomain: 'typy-1b7fc.firebaseapp.com',
  projectId: 'typy-1b7fc',
  storageBucket: 'typy-1b7fc.firebasestorage.app',
  messagingSenderId: '929545563277',
  appId: '1:929545563277:web:ddf16903c09c829d2a86c4',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Local development against emulators: VITE_USE_EMULATORS=true npm run dev
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
