import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

test('typing → results → try again', async () => {
  const user = userEvent.setup()
  render(<App />)

  const input = screen.getByLabelText('Skriv texten ovan här')
  // Paste the whole text in one go (fast); the exercise finishes.
  await user.click(input)
  await user.paste(
    'Det var en gång en räv som bodde vid sjön. Varje morgon gick han ner till stranden för att dricka av det kalla vattnet.',
  )

  await user.click(await screen.findByRole('button', { name: 'Se resultat' }))
  expect(
    await screen.findByText(/Försök 1 av den här övningen/),
  ).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Försök igen' }))
  expect(screen.getByLabelText('Skriv texten ovan här')).toHaveValue('')
})
