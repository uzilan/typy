import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import rules from '../../firestore.rules?raw'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-typy',
    firestore: { rules, host: '127.0.0.1', port: 8080 },
  })
})
afterAll(() => env.cleanup())
beforeEach(() => env.clearFirestore())

function valid(overrides: Record<string, unknown> = {}) {
  return {
    exerciseId: 'korta-ord-pojken',
    finishedAt: Date.now(),
    wpm: 30,
    accuracy: 95,
    elapsedMs: 40_000,
    errors: 2,
    keystrokes: 120,
    errorPositions: [3, 17],
    missesByChar: { ä: 1, ' ': 1 },
    ...overrides,
  }
}

function withoutWpm() {
  const data: Record<string, unknown> = valid()
  delete data.wpm
  return data
}

const alice = () => env.authenticatedContext('alice').firestore()
const bob = () => env.authenticatedContext('bob').firestore()
const anon = () => env.unauthenticatedContext().firestore()
const aliceAttempts = (db: ReturnType<typeof alice>) =>
  collection(db, 'users', 'alice', 'attempts')

async function seedAliceAttempt() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users/alice/attempts/a1'), valid())
  })
}

describe('owner', () => {
  test('can create a valid attempt and read their attempts', async () => {
    await assertSucceeds(addDoc(aliceAttempts(alice()), valid()))
    await assertSucceeds(getDocs(aliceAttempts(alice())))
  })

  test('cannot update or delete an attempt', async () => {
    await seedAliceAttempt()
    const ref = doc(alice(), 'users/alice/attempts/a1')

    await assertFails(updateDoc(ref, { wpm: 999 }))
    await assertFails(deleteDoc(ref))
  })
})

describe('other users', () => {
  test('signed out: no reads, no writes', async () => {
    await seedAliceAttempt()

    await assertFails(getDocs(aliceAttempts(anon())))
    await assertFails(addDoc(aliceAttempts(anon()), valid()))
  })

  test("another user cannot read or write alice's attempts", async () => {
    await seedAliceAttempt()

    await assertFails(getDocs(aliceAttempts(bob())))
    await assertFails(addDoc(aliceAttempts(bob()), valid()))
  })

  test('nothing outside users/{uid}/attempts is accessible', async () => {
    await assertFails(setDoc(doc(alice(), 'users/alice'), { name: 'A' }))
    await assertFails(setDoc(doc(alice(), 'other/x'), { a: 1 }))
  })
})

describe('validation on create', () => {
  test.each([
    ['an extra field', valid({ extra: 'x' })],
    ['a missing field', withoutWpm()],
    ['wpm as a string', valid({ wpm: '30' })],
    ['a fractional wpm', valid({ wpm: 30.5 })],
    ['negative wpm', valid({ wpm: -1 })],
    ['accuracy over 100', valid({ accuracy: 101 })],
    ['an empty exerciseId', valid({ exerciseId: '' })],
    ['a too-long exerciseId', valid({ exerciseId: 'x'.repeat(101) })],
    [
      'finishedAt two days ago',
      valid({ finishedAt: Date.now() - 2 * 86_400_000 }),
    ],
    ['finishedAt an hour ahead', valid({ finishedAt: Date.now() + 3_600_000 })],
    [
      'too many error positions',
      valid({ errorPositions: Array(2001).fill(0) }),
    ],
    ['errorPositions not a list', valid({ errorPositions: 'x' })],
    ['missesByChar not a map', valid({ missesByChar: [] })],
  ])('rejects %s', async (_, data) => {
    await assertFails(addDoc(aliceAttempts(alice()), data))
  })
})
