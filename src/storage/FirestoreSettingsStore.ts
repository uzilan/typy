import { doc, getDoc, setDoc, type Firestore } from 'firebase/firestore'
import type { SettingsStore, UserSettings } from './SettingsStore'

/** Settings stored per user at users/{uid}. */
export class FirestoreSettingsStore implements SettingsStore {
  private readonly db: Firestore
  private readonly uid: string

  constructor(db: Firestore, uid: string) {
    this.db = db
    this.uid = uid
  }

  private ref() {
    return doc(this.db, 'users', this.uid)
  }

  async get(): Promise<UserSettings> {
    const data = (await getDoc(this.ref())).data()
    const settings: UserSettings = {
      skippedLevel0: data?.skippedLevel0 === true,
    }
    if (typeof data?.showKeyboard === 'boolean') {
      settings.showKeyboard = data.showKeyboard
    }
    return settings
  }

  async update(patch: Partial<UserSettings>): Promise<void> {
    await setDoc(this.ref(), patch, { merge: true })
  }
}
