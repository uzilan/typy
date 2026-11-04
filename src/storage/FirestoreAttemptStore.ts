import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
  type Firestore,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import type { Attempt, NewAttempt } from './attempt'
import type { AttemptStore } from './AttemptStore'

/** Attempts stored per user at users/{uid}/attempts/{id}. */
export class FirestoreAttemptStore implements AttemptStore {
  private readonly db: Firestore
  private readonly uid: string

  constructor(db: Firestore, uid: string) {
    this.db = db
    this.uid = uid
  }

  private attempts() {
    return collection(this.db, 'users', this.uid, 'attempts')
  }

  async add(attempt: NewAttempt): Promise<Attempt> {
    const ref = await addDoc(this.attempts(), {
      ...attempt,
      errorPositions: [...attempt.errorPositions],
      missesByChar: { ...attempt.missesByChar },
    })
    return { ...attempt, id: ref.id }
  }

  async listByExercise(exerciseId: string): Promise<Attempt[]> {
    // Filter only (no composite index needed); sort here.
    const snap = await getDocs(
      query(this.attempts(), where('exerciseId', '==', exerciseId)),
    )
    return snap.docs.map(fromDoc).sort((a, b) => b.finishedAt - a.finishedAt)
  }

  async listAll(): Promise<Attempt[]> {
    const snap = await getDocs(
      query(this.attempts(), orderBy('finishedAt', 'desc')),
    )
    return snap.docs.map(fromDoc)
  }
}

function fromDoc(doc: QueryDocumentSnapshot): Attempt {
  return { ...(doc.data() as NewAttempt), id: doc.id }
}
