import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import userEvent from '@testing-library/user-event'
import { LEVELS } from '../../content/levels'
import type { NewAttempt } from '../../storage/attempt'
import { AttemptStoreContext } from '../../storage/AttemptStoreContext'
import { InMemoryAttemptStore } from '../../storage/InMemoryAttemptStore'
import { InMemorySettingsStore } from '../../storage/InMemorySettingsStore'
import { SettingsProvider } from '../../storage/SettingsProvider'
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
        <SettingsProvider>
          <MemoryRouter>
            <LadderScreen />
          </MemoryRouter>
        </SettingsProvider>
      </SettingsStoreContext>
    </AttemptStoreContext>,
  )
  await screen.findByRole('heading', { name: 'Övningar' })
  return settingsStore
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

test('level 0 lists its exercises and offers to skip while level 1 is locked', async () => {
  await setup()

  const l0 = levelSection(0)
  expect(within(l0).getAllByRole('link')).toHaveLength(11)
  expect(
    within(l0).getByText('Grundraden: a s d f j k l ö'),
  ).toBeInTheDocument()
  expect(
    within(l0).getByRole('button', { name: 'Jag kan redan skriva' }),
  ).toBeInTheDocument()
  expect(within(levelSection(1)).getByText('Låst')).toBeInTheDocument()
})

test('skipping level 0 unlocks level 1 and hides the button', async () => {
  const settingsStore = await setup()

  await userEvent.click(
    screen.getByRole('button', { name: 'Jag kan redan skriva' }),
  )

  expect(
    screen.queryByRole('button', { name: 'Jag kan redan skriva' }),
  ).not.toBeInTheDocument()
  expect(within(levelSection(1)).queryByText('Låst')).not.toBeInTheDocument()
  expect(within(levelSection(0)).getAllByRole('link')).toHaveLength(11)
  await waitFor(async () =>
    expect(await settingsStore.get()).toMatchObject({ skippedLevel0: true }),
  )
})

test('no skip button once level 1 has attempts', async () => {
  await setup([attempt(LEVELS[1]!.exercises[0]!.id)])

  expect(
    screen.queryByRole('button', { name: 'Jag kan redan skriva' }),
  ).not.toBeInTheDocument()
})
