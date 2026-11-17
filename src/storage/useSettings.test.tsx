import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { SettingsStore, UserSettings } from './SettingsStore'
import { SettingsProvider } from './SettingsProvider'
import { SettingsStoreContext } from './SettingsStoreContext'
import { useSettings } from './useSettings'

function wrapperFor(store: SettingsStore) {
  return ({ children }: { children: ReactNode }) => (
    <SettingsStoreContext value={store}>
      <SettingsProvider>{children}</SettingsProvider>
    </SettingsStoreContext>
  )
}

test('falls back to defaults when loading settings fails', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const store: SettingsStore = {
    get: () => Promise.reject(new Error('denied')),
    update: () => Promise.resolve(),
  }

  const { result } = renderHook(() => useSettings(), {
    wrapper: wrapperFor(store),
  })

  await waitFor(() =>
    expect(result.current.settings).toEqual({ skippedLevel0: false }),
  )
  expect(error).toHaveBeenCalled()
  error.mockRestore()
})

test('an update made before loading finishes is kept after the load', async () => {
  let resolveGet: (s: UserSettings) => void = () => {}
  const update = vi.fn(() => Promise.resolve())
  const store: SettingsStore = {
    get: () =>
      new Promise<UserSettings>((resolve) => {
        resolveGet = resolve
      }),
    update,
  }

  const { result } = renderHook(() => useSettings(), {
    wrapper: wrapperFor(store),
  })
  act(() => result.current.update({ showKeyboard: true }))
  expect(result.current.settings).toBeNull()
  await act(async () => resolveGet({ skippedLevel0: false }))

  expect(result.current.settings).toEqual({
    skippedLevel0: false,
    showKeyboard: true,
  })
  expect(update).toHaveBeenCalledWith({ showKeyboard: true })
})

test('consumers share a single load', async () => {
  const get = vi.fn(() => Promise.resolve({ skippedLevel0: false }))
  const store: SettingsStore = { get, update: () => Promise.resolve() }

  const { result } = renderHook(() => [useSettings(), useSettings()], {
    wrapper: wrapperFor(store),
  })

  await waitFor(() => expect(result.current[0]?.settings).not.toBeNull())
  expect(result.current[1]?.settings).toBe(result.current[0]?.settings)
  expect(get).toHaveBeenCalledTimes(1)
})
