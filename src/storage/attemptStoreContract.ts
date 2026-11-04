import type { NewAttempt } from './attempt'
import type { AttemptStore } from './AttemptStore'

/**
 * Behaviour every AttemptStore must have. Call from a test file with a
 * factory for the implementation under test; each call must give an empty
 * store. Times are relative to now, since a remote store may reject
 * timestamps far from the server clock.
 */
export function describeAttemptStore(
  name: string,
  makeStore: () => AttemptStore | Promise<AttemptStore>,
) {
  const base = Date.now() - 60_000
  const at = (offset: number) => base + offset

  function attempt(overrides: Partial<NewAttempt> = {}): NewAttempt {
    return {
      exerciseId: 'ex-1',
      finishedAt: at(1000),
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

  describe(`${name} (AttemptStore contract)`, () => {
    test('starts empty', async () => {
      const store = await makeStore()

      expect(await store.listAll()).toEqual([])
      expect(await store.listByExercise('ex-1')).toEqual([])
    })

    test('add returns the attempt with a unique id', async () => {
      const store = await makeStore()

      const a = await store.add(attempt())
      const b = await store.add(attempt())

      expect(a).toEqual({ ...attempt(), id: a.id })
      expect(a.id).toBeTruthy()
      expect(b.id).not.toBe(a.id)
    })

    test('a stored attempt reads back unchanged', async () => {
      const store = await makeStore()

      const saved = await store.add(attempt())

      expect(await store.listAll()).toEqual([saved])
    })

    test('listByExercise returns only that exercise, newest first', async () => {
      const store = await makeStore()
      await store.add(attempt({ exerciseId: 'ex-1', finishedAt: at(100) }))
      await store.add(attempt({ exerciseId: 'ex-2', finishedAt: at(200) }))
      await store.add(attempt({ exerciseId: 'ex-1', finishedAt: at(300) }))

      const list = await store.listByExercise('ex-1')

      expect(list.map((a) => a.finishedAt)).toEqual([at(300), at(100)])
    })

    test('listAll returns every attempt, newest first', async () => {
      const store = await makeStore()
      await store.add(attempt({ exerciseId: 'ex-1', finishedAt: at(200) }))
      await store.add(attempt({ exerciseId: 'ex-2', finishedAt: at(300) }))
      await store.add(attempt({ exerciseId: 'ex-1', finishedAt: at(100) }))

      const list = await store.listAll()

      expect(list.map((a) => a.finishedAt)).toEqual([at(300), at(200), at(100)])
    })

    test('changing a returned list does not change the store', async () => {
      const store = await makeStore()
      await store.add(attempt())

      const list = await store.listAll()
      list.pop()

      expect(await store.listAll()).toHaveLength(1)
    })
  })
}
