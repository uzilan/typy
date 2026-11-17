import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { LEVELS } from '../../content/levels'
import type { NewAttempt } from '../../storage/attempt'
import { AttemptStoreContext } from '../../storage/AttemptStoreContext'
import { InMemoryAttemptStore } from '../../storage/InMemoryAttemptStore'
import { InMemorySettingsStore } from '../../storage/InMemorySettingsStore'
import { SettingsStoreContext } from '../../storage/SettingsStoreContext'
import { LadderScreen } from './LadderScreen'

function attempt(exerciseId: string, wpm = 30, accuracy = 95): NewAttempt {
  return {
    exerciseId,
    finishedAt: 1,
    wpm,
    accuracy,
    elapsedMs: 1000,
    errors: 0,
    keystrokes: 10,
    errorPositions: [],
    missesByChar: {},
  }
}

async function setup(
  attempts: NewAttempt[] = [],
  settings: { skippedLevel0: boolean } = { skippedLevel0: false },
) {
  const store = new InMemoryAttemptStore()
  for (const a of attempts) await store.add(a)
  const settingsStore = new InMemorySettingsStore()
  await settingsStore.update(settings)
  render(
    <AttemptStoreContext value={store}>
      <SettingsStoreContext value={settingsStore}>
        <MemoryRouter>
          <LadderScreen />
        </MemoryRouter>
      </SettingsStoreContext>
    </AttemptStoreContext>,
  )
  await screen.findByRole('heading', { name: 'Övningar' })
}

function levelSection(number: number) {
  const level = LEVELS.find((l) => l.number === number)!
  return screen.getByRole('region', { name: level.name })
}

test('a new user has level 0 open and level 1 locked', async () => {
  await setup()

  expect(within(levelSection(0)).getAllByRole('link').length).toBeGreaterThan(0)
  const l1 = levelSection(1)
  expect(within(l1).getByText('Låst')).toBeInTheDocument()
  expect(within(l1).queryAllByRole('link')).toHaveLength(0)
})

test('level 1 is open with links to its exercises, the rest are locked', async () => {
  await setup([], { skippedLevel0: true })

  const l1 = levelSection(1)
  expect(within(l1).getByText(/Pågår · 0\/5/)).toBeInTheDocument()
  const links = within(l1).getAllByRole('link')
  expect(links).toHaveLength(5)
  expect(links[0]).toHaveAttribute(
    'href',
    `/ovning/${LEVELS[1]!.exercises[0]!.id}`,
  )

  const l2 = levelSection(2)
  expect(within(l2).getByText('Låst')).toBeInTheDocument()
  expect(within(l2).queryAllByRole('link')).toHaveLength(0)
  expect(
    within(l2).getByText(/låses upp när nivå 1 är klar/),
  ).toBeInTheDocument()
})

test('shows best result per exercise and unlocks the next level', async () => {
  const [a, b, c, d, e] = LEVELS[1]!.exercises
  await setup([
    attempt(a!.id, 20, 90),
    attempt(a!.id, 34, 98),
    attempt(b!.id),
    attempt(c!.id),
    attempt(d!.id),
    attempt(e!.id),
  ])

  const l1 = levelSection(1)
  expect(within(l1).getByText(/Klar · 5\/5/)).toBeInTheDocument()
  expect(within(l1).getByText('34 ord/min · 98 %')).toBeInTheDocument()

  const l2 = levelSection(2)
  expect(within(l2).getByText(/Pågår · 0\/5/)).toBeInTheDocument()
  expect(within(l2).getAllByRole('link')).toHaveLength(5)
  expect(within(l2).getAllByText('Inte påbörjad')).toHaveLength(5)
})
