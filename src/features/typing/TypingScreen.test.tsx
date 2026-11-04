import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TypingScreen } from './TypingScreen'
import { formatDuration } from './formatDuration'

function setup(text = 'räv') {
  const user = userEvent.setup()
  render(
    <TypingScreen
      level="Nivå 3 · Meningar"
      title="Räven vid sjön"
      text={text}
    />,
  )
  const input = screen.getByLabelText('Skriv texten ovan här')
  return { user, input }
}

function charStates() {
  return [...document.querySelectorAll('[data-state]')].map((el) =>
    el.getAttribute('data-state'),
  )
}

test('shows the exercise and focuses the input', () => {
  const { input } = setup()

  expect(screen.getByText(/Räven vid sjön/)).toBeInTheDocument()
  expect(input).toHaveFocus()
  expect(charStates()).toEqual(['current', 'pending', 'pending'])
  expect(screen.getByText('0 / 3 tecken')).toBeInTheDocument()
})

test('marks characters as they are typed', async () => {
  const { user, input } = setup()

  await user.type(input, 'ra')

  expect(charStates()).toEqual(['correct', 'incorrect', 'current'])
  expect(screen.getByText('2 / 3 tecken')).toBeInTheDocument()
})

test('Enter does not add a line break', async () => {
  const { user, input } = setup()

  await user.type(input, 'r{Enter}ä')

  expect(input).toHaveValue('rä')
  expect(charStates()).toEqual(['correct', 'correct', 'current'])
})

test('shows no stats while typing', async () => {
  const { user, input } = setup()

  await user.type(input, 'rä')

  expect(screen.queryByText('Klart!')).not.toBeInTheDocument()
  expect(screen.queryByText(/ord per minut/)).not.toBeInTheDocument()
})

test('finishing locks the input and shows stats', async () => {
  const { user, input } = setup()

  await user.type(input, 'räv')

  expect(screen.getByText('Klart!')).toBeInTheDocument()
  expect(
    screen.getByText(/ord per minut · 100 % precision/),
  ).toBeInTheDocument()
  expect(input).toBeDisabled()
})

test('Börja om resets and refocuses the input', async () => {
  const { user, input } = setup()
  await user.type(input, 'räv')

  await user.click(screen.getByRole('button', { name: 'Börja om' }))

  expect(screen.queryByText('Klart!')).not.toBeInTheDocument()
  expect(input).toHaveValue('')
  expect(input).toBeEnabled()
  expect(input).toHaveFocus()
  expect(charStates()).toEqual(['current', 'pending', 'pending'])
})

describe('formatDuration', () => {
  test.each([
    [0, '0:00'],
    [999, '0:00'],
    [44_000, '0:44'],
    [65_500, '1:05'],
    [600_000, '10:00'],
  ])('%i ms → %s', (ms, text) => {
    expect(formatDuration(ms)).toBe(text)
  })
})
