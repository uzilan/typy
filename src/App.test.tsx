import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from './App'
import { LEVELS } from './content/levels'
import { InMemoryAttemptStore } from './storage/InMemoryAttemptStore'

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App store={new InMemoryAttemptStore()} />
    </MemoryRouter>,
  )
}

test('ladder → exercise → results → next exercise / back to ladder', async () => {
  const user = userEvent.setup()
  const [first, second] = LEVELS[0]!.exercises
  renderAt('/')

  await user.click(
    await screen.findByRole('link', { name: new RegExp(first!.title) }),
  )
  const input = await screen.findByLabelText('Skriv texten ovan här')
  expect(screen.getByText(/Ur/)).toHaveTextContent(first!.source.author)

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
  expect(await screen.findByText(/Pågår · 1\/3/)).toBeInTheDocument()
})

test('Försök igen returns to a fresh typing screen', async () => {
  const user = userEvent.setup()
  const first = LEVELS[0]!.exercises[0]!
  renderAt(`/ovning/${first.id}`)

  const input = await screen.findByLabelText('Skriv texten ovan här')
  await user.click(input)
  await user.paste(first.text)
  await user.click(await screen.findByRole('button', { name: 'Se resultat' }))
  await user.click(await screen.findByRole('button', { name: 'Försök igen' }))

  expect(await screen.findByLabelText('Skriv texten ovan här')).toHaveValue('')
})

test('a locked exercise redirects to the ladder', async () => {
  renderAt(`/ovning/${LEVELS[1]!.exercises[0]!.id}`)

  expect(
    await screen.findByRole('heading', { name: 'Övningar' }),
  ).toBeInTheDocument()
})

test('an unknown exercise shows a not-found message', async () => {
  renderAt('/ovning/finns-inte')

  expect(
    await screen.findByRole('heading', { name: 'Övningen finns inte.' }),
  ).toBeInTheDocument()
})
