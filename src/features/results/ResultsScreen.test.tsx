import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import type { NewAttempt } from '../../storage/attempt'
import { AttemptStoreContext } from '../../storage/AttemptStoreContext'
import { InMemoryAttemptStore } from '../../storage/InMemoryAttemptStore'
import { ResultsScreen } from './ResultsScreen'

const TEXT = 'räv och älg'

function attempt(overrides: Partial<NewAttempt> = {}): NewAttempt {
  return {
    exerciseId: 'ex',
    finishedAt: Date.UTC(2026, 10, 4, 12, 0),
    wpm: 30,
    accuracy: 90,
    elapsedMs: 44_000,
    errors: 2,
    keystrokes: 20,
    errorPositions: [1, 8],
    missesByChar: { ä: 2 },
    ...overrides,
  }
}

async function setup(
  attempts: NewAttempt[],
  { nextHref = null as string | null, attemptId = '' } = {},
) {
  const store = new InMemoryAttemptStore()
  const saved = []
  for (const a of attempts) saved.push(await store.add(a))
  const onRetry = vi.fn()
  render(
    <AttemptStoreContext value={store}>
      <MemoryRouter>
        <ResultsScreen
          exerciseId="ex"
          attemptId={attemptId || saved[saved.length - 1]!.id}
          level="Nivå 3 · Meningar"
          title="Räven"
          text={TEXT}
          nextHref={nextHref}
          onRetry={onRetry}
        />
      </MemoryRouter>
    </AttemptStoreContext>,
  )
  await screen.findByRole('heading', { level: 1 })
  return { onRetry }
}

test('links to the next exercise and back to all exercises', async () => {
  await setup([attempt()], { nextHref: '/ovning/nasta' })

  expect(screen.getByRole('link', { name: 'Nästa övning' })).toHaveAttribute(
    'href',
    '/ovning/nasta',
  )
  expect(screen.getByRole('link', { name: 'Alla övningar' })).toHaveAttribute(
    'href',
    '/',
  )
})

test('no next link when there is no next exercise', async () => {
  await setup([attempt()])

  expect(screen.queryByRole('link', { name: 'Nästa övning' })).toBeNull()
})

test('an attempt that no longer exists says so', async () => {
  await setup([attempt()], { attemptId: 'gone' })

  expect(
    screen.getByRole('heading', { name: 'Resultatet finns inte' }),
  ).toBeInTheDocument()
})

test('shows the stats of the current attempt', async () => {
  await setup([attempt()])

  const stats = screen.getByTestId('stats')
  expect(stats).toHaveTextContent('30 ord/min')
  expect(stats).toHaveTextContent('90 % precision')
  expect(stats).toHaveTextContent('44 s tid')
  expect(stats).toHaveTextContent('2 fel')
})

test('first attempt is the best so far', async () => {
  await setup([attempt()])

  expect(
    screen.getByText('Försök 1 av den här övningen · ditt bästa hittills'),
  ).toBeInTheDocument()
})

test('a slower attempt is not the best', async () => {
  await setup([
    attempt({ finishedAt: 1, wpm: 40 }),
    attempt({ finishedAt: 2, wpm: 30 }),
  ])

  expect(screen.getByText('Försök 2 av den här övningen')).toBeInTheDocument()
})

test('marks the characters that were typed wrong', async () => {
  await setup([attempt()])

  const marked = [...document.querySelectorAll('[data-error]')].map(
    (el) => el.textContent,
  )
  expect(marked).toEqual(['ä', 'ä'])
})

test('lists characters to practice', async () => {
  await setup([attempt({ missesByChar: { ä: 2, ' ': 1 } })])

  const list = screen.getByRole('list', { name: 'Tecken att öva på' })
  expect(
    within(list)
      .getAllByRole('listitem')
      .map((li) => li.textContent),
  ).toEqual(['ä2 fel', '␣mellanslag, 1 fel'])
})

test('a perfect run says so instead', async () => {
  await setup([attempt({ errors: 0, errorPositions: [], missesByChar: {} })])

  expect(screen.getByText('Inga fel – snyggt!')).toBeInTheDocument()
  expect(screen.queryByRole('list', { name: 'Tecken att öva på' })).toBeNull()
})

test('table lists all attempts newest first with current and best marked', async () => {
  await setup([
    attempt({ finishedAt: 1, wpm: 40 }),
    attempt({ finishedAt: 2, wpm: 20 }),
    attempt({ finishedAt: 3, wpm: 30 }),
  ])

  const rows = within(
    screen.getByRole('table', { name: 'Alla försök på övningen' }),
  ).getAllByRole('row')
  const body = rows.slice(1) // skip header
  expect(body).toHaveLength(3)
  expect(body[0]).toHaveTextContent(/^3\s*NU/)
  expect(body[2]).toHaveTextContent(/^1\s*BÄST/)
})

test('Försök igen calls onRetry', async () => {
  const { onRetry } = await setup([attempt()])

  await userEvent.click(screen.getByRole('button', { name: 'Försök igen' }))

  expect(onRetry).toHaveBeenCalledTimes(1)
})
