import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { LEVELS } from '../../content/levels'
import type { NewAttempt } from '../../storage/attempt'
import { AttemptStoreContext } from '../../storage/AttemptStoreContext'
import { InMemoryAttemptStore } from '../../storage/InMemoryAttemptStore'
import { ProgressScreen } from './ProgressScreen'

const EX = LEVELS[0]!.exercises[0]!

function attempt(finishedAt: number, wpm: number, accuracy = 95): NewAttempt {
  return {
    exerciseId: EX.id,
    finishedAt,
    wpm,
    accuracy,
    elapsedMs: 1000,
    errors: 0,
    keystrokes: 10,
    errorPositions: [],
    missesByChar: {},
  }
}

async function setup(attempts: NewAttempt[]) {
  const store = new InMemoryAttemptStore()
  for (const a of attempts) await store.add(a)
  render(
    <AttemptStoreContext value={store}>
      <MemoryRouter>
        <ProgressScreen />
      </MemoryRouter>
    </AttemptStoreContext>,
  )
  await screen.findByRole('heading', { name: 'Mina framsteg' })
}

test('no attempts yet', async () => {
  await setup([])

  expect(screen.getByText('Inga försök än.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /övningarna/ })).toHaveAttribute(
    'href',
    '/',
  )
})

test('summary tiles and two charts', async () => {
  await setup([attempt(1, 20, 90), attempt(2, 34, 98), attempt(3, 30, 95)])

  const tile = (label: string) => screen.getByText(label).parentElement!
  expect(tile('Bästa ord/min')).toHaveTextContent(`34${EX.title}`)
  expect(tile('Snitt ord/min')).toHaveTextContent('28')
  expect(tile('Snitt precision')).toHaveTextContent('94 %')
  expect(tile('Antal försök')).toHaveTextContent('3')

  expect(
    screen.getByRole('figure', { name: 'Ord per minut' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('figure', { name: 'Precision' })).toBeInTheDocument()
})

test('switching between the last 20 and all attempts', async () => {
  const user = userEvent.setup()
  await setup(Array.from({ length: 25 }, (_, i) => attempt(i + 1, 20 + i)))

  const chart = () => screen.getByRole('figure', { name: 'Ord per minut' })
  const rows = () => within(chart()).getAllByRole('row').length - 1

  expect(
    screen.getByRole('button', { name: 'Senaste 20 försöken' }),
  ).toHaveAttribute('aria-pressed', 'true')
  expect(rows()).toBe(20)

  await user.click(screen.getByRole('button', { name: 'Alla' }))

  expect(rows()).toBe(25)
  expect(screen.getByText('Antal försök').parentElement).toHaveTextContent('25')
})
