import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { SettingsStore } from './SettingsStore'
import { SettingsStoreContext } from './SettingsStoreContext'
import { useSettings } from './useSettings'

test('falls back to defaults when loading settings fails', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const store: SettingsStore = {
    get: () => Promise.reject(new Error('denied')),
    update: () => Promise.resolve(),
  }
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SettingsStoreContext.Provider value={store}>
      {children}
    </SettingsStoreContext.Provider>
  )

  const { result } = renderHook(() => useSettings(), { wrapper })

  await waitFor(() =>
    expect(result.current.settings).toEqual({ skippedLevel0: false }),
  )
  expect(error).toHaveBeenCalled()
  error.mockRestore()
})
