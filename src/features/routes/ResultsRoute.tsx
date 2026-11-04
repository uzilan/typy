import { useNavigate, useParams } from 'react-router'
import { findExercise, levelLabel, LEVELS } from '../../content/levels'
import { useAllAttempts } from '../../storage/useAllAttempts'
import { nextExercise } from '../ladder/progress'
import { ResultsScreen } from '../results/ResultsScreen'
import { NotFound } from './NotFound'

export function ResultsRoute() {
  const { id = '', attemptId = '' } = useParams()
  const navigate = useNavigate()
  const attempts = useAllAttempts()
  const exercise = findExercise(id)

  if (!exercise) return <NotFound message="Övningen finns inte." />
  if (attempts === null) return null

  const next = nextExercise(exercise.id, LEVELS, attempts)

  return (
    <ResultsScreen
      exerciseId={exercise.id}
      attemptId={attemptId}
      level={levelLabel(exercise.levelNumber)}
      title={exercise.title}
      text={exercise.text}
      nextHref={next ? `/ovning/${next.id}` : null}
      onRetry={() => navigate(`/ovning/${exercise.id}`)}
    />
  )
}
