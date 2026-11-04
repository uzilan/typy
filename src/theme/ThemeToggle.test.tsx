import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

function mockSystemTheme(dark: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: dark })
}

afterEach(() => {
  delete document.documentElement.dataset.theme
})

test('starts from the system theme and toggles to the other one', async () => {
  mockSystemTheme(true)
  render(<ThemeToggle />)

  expect(document.documentElement.dataset.theme).toBeUndefined()
  await userEvent.click(screen.getByRole('button', { name: /ljust/ }))

  expect(document.documentElement.dataset.theme).toBe('light')
  expect(screen.getByRole('button', { name: /mörkt/ })).toBeInTheDocument()
})

test('light system theme toggles to dark', async () => {
  mockSystemTheme(false)
  render(<ThemeToggle />)

  await userEvent.click(screen.getByRole('button', { name: /mörkt/ }))

  expect(document.documentElement.dataset.theme).toBe('dark')
})
