import { Link } from 'react-router'

export function NotFound({
  message = 'Sidan finns inte.',
}: {
  message?: string
}) {
  return (
    <div>
      <h1>{message}</h1>
      <p>
        <Link to="/">Till övningarna</Link>
      </p>
    </div>
  )
}
