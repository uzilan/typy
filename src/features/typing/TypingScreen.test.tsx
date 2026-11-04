import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TypingScreen } from './TypingScreen'
import { formatDuration } from './formatDuration'
import { AttemptStoreContext } from '../../storage/AttemptStoreContext'
import { InMemoryAttemptStore } from '../../storage/InMemoryAttemptStore'

function setup(text = 'räv') {
  const user = userEvent.setup()
  const store = new InMemoryAttemptStore()
  const add = vi.spyOn(store, 'add')
  render(
    <AttemptStoreContext value={store}>
      <TypingScreen
        exerciseId="raven-vid-sjon"
        level="Nivå 3 · Meningar"
        title="Räven vid sjön"
        text={text}
      />
    </AttemptStoreContext>,
  )
  const input = screen.getByLabelText('Skriv texten ovan här')
  return { user, input, store, add }
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

describe('saving attempts', () => {
  test('saves one attempt when finished', async () => {
    const { user, input, store, add } = setup()

    await user.type(input, 'rav')

    await waitFor(() => expect(add).toHaveBeenCalledTimes(1))
    const [saved] = await store.listByExercise('raven-vid-sjon')
    expect(saved).toMatchObject({
      exerciseId: 'raven-vid-sjon',
      accuracy: 67,
      errors: 1,
      errorPositions: [1],
      missesByChar: { ä: 1 },
    })
  })

  test('does not save when restarted before finishing', async () => {
    const { user, input, add } = setup()

    await user.type(input, 'rä')
    await user.click(screen.getByRole('button', { name: 'Börja om' }))

    expect(add).not.toHaveBeenCalled()
  })

  test('each finished round is saved once', async () => {
    const { user, input, store } = setup()

    await user.type(input, 'räv')
    await user.click(screen.getByRole('button', { name: 'Börja om' }))
    await user.type(input, 'räv')

    await waitFor(async () =>
      expect(await store.listByExercise('raven-vid-sjon')).toHaveLength(2),
    )
  })
})

describe('formatDuration', () => {
  test.each([
    [0, '0 s'],
    [999, '0 s'],
    [44_000, '44 s'],
    [60_000, '1 min'],
    [65_500, '1 min 5 s'],
    [600_000, '10 min'],
  ])('%i ms → %s', (ms, text) => {
    expect(formatDuration(ms)).toBe(text)
  })
})
