import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignInScreen } from './SignInScreen'

test('the button signs in', async () => {
  const onSignIn = vi.fn().mockResolvedValue(undefined)
  render(<SignInScreen onSignIn={onSignIn} />)

  await userEvent.click(
    screen.getByRole('button', { name: 'Logga in med Google' }),
  )

  expect(onSignIn).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole('alert')).toBeNull()
})

test('a failed sign-in shows an error', async () => {
  const onSignIn = vi
    .fn()
    .mockRejectedValue({ code: 'auth/network-request-failed' })
  render(<SignInScreen onSignIn={onSignIn} />)

  await userEvent.click(
    screen.getByRole('button', { name: 'Logga in med Google' }),
  )

  expect(await screen.findByRole('alert')).toHaveTextContent('misslyckades')
})

test('closing the Google window is not an error', async () => {
  const onSignIn = vi
    .fn()
    .mockRejectedValue({ code: 'auth/popup-closed-by-user' })
  render(<SignInScreen onSignIn={onSignIn} />)

  await userEvent.click(
    screen.getByRole('button', { name: 'Logga in med Google' }),
  )

  expect(screen.queryByRole('alert')).toBeNull()
})
