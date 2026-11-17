import type { SettingsStore } from './SettingsStore'

/**
 * Behaviour every SettingsStore must have. Call from a test file with a
 * factory for the implementation under test; each call must give a store
 * with nothing stored.
 */
export function describeSettingsStore(
  name: string,
  make: () => SettingsStore | Promise<SettingsStore>,
) {
  describe(name, () => {
    test('defaults when nothing stored', async () => {
      expect(await (await make()).get()).toEqual({ skippedLevel0: false })
    })

    test('update merges', async () => {
      const s = await make()
      await s.update({ showKeyboard: true })
      await s.update({ skippedLevel0: true })
      expect(await s.get()).toEqual({ skippedLevel0: true, showKeyboard: true })
    })

    test('showKeyboard can be turned off', async () => {
      const s = await make()
      await s.update({ showKeyboard: true })
      await s.update({ showKeyboard: false })
      expect((await s.get()).showKeyboard).toBe(false)
    })

    test('get returns a copy, not internal state', async () => {
      const s = await make()
      const got = await s.get()
      got.skippedLevel0 = true
      expect((await s.get()).skippedLevel0).toBe(false)
    })
  })
}
