import { render, screen, within } from '@testing-library/react'
import { LineChart, niceScale } from './LineChart'

describe('niceScale', () => {
  test('starts at zero for speed, top rounded up to a whole step (at least 40)', () => {
    expect(niceScale([12, 18], { zeroBased: true })).toEqual({
      min: 0,
      max: 40,
      step: 10,
    })
    expect(niceScale([12, 57], { zeroBased: true })).toEqual({
      min: 0,
      max: 60,
      step: 20,
    })
  })

  test('large values get a bigger step, so there are at most ~5 ticks', () => {
    expect(niceScale([300, 1242], { zeroBased: true })).toEqual({
      min: 0,
      max: 1500,
      step: 500,
    })
    expect(niceScale([80, 130], { zeroBased: true })).toEqual({
      min: 0,
      max: 150,
      step: 50,
    })
  })

  test('accuracy: a tight range ending at 100', () => {
    expect(niceScale([88, 97], { zeroBased: false, max: 100 })).toEqual({
      min: 80,
      max: 100,
      step: 5,
    })
    expect(niceScale([52, 97], { zeroBased: false, max: 100 })).toEqual({
      min: 50,
      max: 100,
      step: 10,
    })
  })
})

test('one hover point and one table row per value', () => {
  render(
    <LineChart
      title="Ord per minut"
      unit="ord/min"
      points={[
        { number: 3, value: 20 },
        { number: 4, value: 26 },
      ]}
      scale={{ min: 0, max: 40, step: 10 }}
    />,
  )

  const figure = screen.getByRole('figure', { name: 'Ord per minut' })
  expect(within(figure).getByTitle('Försök 3: 20 ord/min')).toBeInTheDocument()
  expect(within(figure).getByTitle('Försök 4: 26 ord/min')).toBeInTheDocument()

  const rows = within(figure).getAllByRole('row')
  expect(rows.slice(1).map((r) => r.textContent)).toEqual(['320', '426'])
})
