import { Navigate, useNavigate, useParams } from 'react-router'
import { findExercise, levelLabel, LEVELS } from '../../content/levels'
import { useAllAttempts } from '../../storage/useAllAttempts'
import { isUnlocked } from '../ladder/progress'
import { TypingScreen } from '../typing/TypingScreen'
import { NotFound } from './NotFound'

export function ExerciseRoute() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const attempts = useAllAttempts()
  const exercise = findExercise(id)

  if (!exercise) return <NotFound message="Övningen finns inte." />
  if (attempts === null) return null
  if (!isUnlocked(exercise.levelNumber, LEVELS, attempts)) {
    return <Navigate to="/" replace />
  }

  return (
    <TypingScreen
      key={exercise.id}
      exerciseId={exercise.id}
      level={levelLabel(exercise.levelNumber)}
      title={exercise.title}
      text={exercise.text}
      source={exercise.source}
      onShowResults={(attemptId) =>
        navigate(`/ovning/${exercise.id}/resultat/${attemptId}`)
      }
    />
  )
}
