import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from './App'
import { LEVELS } from './content/levels'
import { InMemoryAttemptStore } from './storage/InMemoryAttemptStore'
import { InMemorySettingsStore } from './storage/InMemorySettingsStore'

async function renderAt(path: string, skippedLevel0 = true) {
  const settings = new InMemorySettingsStore()
  await settings.update({ skippedLevel0 })
  render(
    <MemoryRouter initialEntries={[path]}>
      <App store={new InMemoryAttemptStore()} settings={settings} />
    </MemoryRouter>,
  )
}

test('ladder → exercise → results → next exercise / back to ladder', async () => {
  const user = userEvent.setup()
  const [first, second] = LEVELS[1]!.exercises
  await renderAt('/')

  await user.click(
    await screen.findByRole('link', { name: new RegExp(first!.title) }),
  )
  const input = await screen.findByLabelText('Skriv texten ovan här')

  await user.click(input)
  await user.paste(first!.text)
  await user.click(await screen.findByRole('button', { name: 'Se resultat' }))
  expect(
    await screen.findByText(/Försök 1 av den här övningen/),
  ).toBeInTheDocument()

  expect(screen.getByRole('link', { name: 'Nästa övning' })).toHaveAttribute(
    'href',
    `/ovning/${second!.id}`,
  )

  await user.click(screen.getByRole('link', { name: 'Alla övningar' }))
  expect(await screen.findByText(/Pågår · 1\/5/)).toBeInTheDocument()
})

test('Försök igen returns to a fresh typing screen', async () => {
  const user = userEvent.setup()
  const first = LEVELS[1]!.exercises[0]!
  await renderAt(`/ovning/${first.id}`)

  const input = await screen.findByLabelText('Skriv texten ovan här')
  await user.click(input)
  await user.paste(first.text)
  await user.click(await screen.findByRole('button', { name: 'Se resultat' }))
  await user.click(await screen.findByRole('button', { name: 'Försök igen' }))

  expect(await screen.findByLabelText('Skriv texten ovan här')).toHaveValue('')
})

test('a locked exercise redirects to the ladder', async () => {
  await renderAt(`/ovning/${LEVELS[2]!.exercises[0]!.id}`)

  expect(
    await screen.findByRole('heading', { name: 'Övningar' }),
  ).toBeInTheDocument()
})

test('a new user opening a level 1 exercise is redirected to the ladder', async () => {
  await renderAt(`/ovning/${LEVELS[1]!.exercises[0]!.id}`, false)

  expect(
    await screen.findByRole('heading', { name: 'Övningar' }),
  ).toBeInTheDocument()
  expect(screen.queryByLabelText('Skriv texten ovan här')).toBeNull()
})

test('the menu leads to progress and back to the exercises', async () => {
  const user = userEvent.setup()
  await renderAt(`/ovning/${LEVELS[1]!.exercises[0]!.id}`)
  const menu = await screen.findByRole('navigation', { name: 'Huvudmeny' })

  await user.click(within(menu).getByRole('link', { name: 'Mina framsteg' }))
  expect(
    await screen.findByRole('heading', { name: 'Mina framsteg' }),
  ).toBeInTheDocument()
  expect(
    within(menu).getByRole('link', { name: 'Mina framsteg' }),
  ).toHaveAttribute('aria-current', 'page')

  await user.click(within(menu).getByRole('link', { name: 'Övningar' }))
  expect(
    await screen.findByRole('heading', { name: 'Övningar' }),
  ).toBeInTheDocument()
})

test('an unknown exercise shows a not-found message', async () => {
  await renderAt('/ovning/finns-inte')

  expect(
    await screen.findByRole('heading', { name: 'Övningen finns inte.' }),
  ).toBeInTheDocument()
})

test('Logga ut signs out', async () => {
  const user = userEvent.setup()
  const onSignOut = vi.fn()
  render(
    <MemoryRouter>
      <App
        store={new InMemoryAttemptStore()}
        settings={new InMemorySettingsStore()}
        onSignOut={onSignOut}
      />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Logga ut' }))

  expect(onSignOut).toHaveBeenCalledTimes(1)
})
