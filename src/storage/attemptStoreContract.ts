import type { NewAttempt } from './attempt'
import type { AttemptStore } from './AttemptStore'

/**
 * Behaviour every AttemptStore must have. Call from a test file with a
 * factory for the implementation under test.
 */
export function describeAttemptStore(
  name: string,
  makeStore: () => AttemptStore,
) {
  function attempt(overrides: Partial<NewAttempt> = {}): NewAttempt {
    return {
      exerciseId: 'ex-1',
      finishedAt: 1000,
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
      const store = makeStore()

      expect(await store.listAll()).toEqual([])
      expect(await store.listByExercise('ex-1')).toEqual([])
    })

    test('add returns the attempt with a unique id', async () => {
      const store = makeStore()

      const a = await store.add(attempt())
      const b = await store.add(attempt())

      expect(a).toEqual({ ...attempt(), id: a.id })
      expect(a.id).toBeTruthy()
      expect(b.id).not.toBe(a.id)
    })

    test('listByExercise returns only that exercise, newest first', async () => {
      const store = makeStore()
      await store.add(attempt({ exerciseId: 'ex-1', finishedAt: 100 }))
      await store.add(attempt({ exerciseId: 'ex-2', finishedAt: 200 }))
      await store.add(attempt({ exerciseId: 'ex-1', finishedAt: 300 }))

      const list = await store.listByExercise('ex-1')

      expect(list.map((a) => a.finishedAt)).toEqual([300, 100])
    })

    test('listAll returns every attempt, newest first', async () => {
      const store = makeStore()
      await store.add(attempt({ exerciseId: 'ex-1', finishedAt: 200 }))
      await store.add(attempt({ exerciseId: 'ex-2', finishedAt: 300 }))
      await store.add(attempt({ exerciseId: 'ex-1', finishedAt: 100 }))

      const list = await store.listAll()

      expect(list.map((a) => a.finishedAt)).toEqual([300, 200, 100])
    })

    test('changing a returned list does not change the store', async () => {
      const store = makeStore()
      await store.add(attempt())

      const list = await store.listAll()
      list.pop()

      expect(await store.listAll()).toHaveLength(1)
    })
  })
}
