import { render } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Keyboard } from './Keyboard'

function key(container: HTMLElement, id: string) {
  return container.querySelector(`[data-key="${id}"]`)!
}

function activeFingers(container: HTMLElement) {
  return [
    ...container.querySelectorAll('[data-finger][data-active="true"]'),
  ].filter((el) => !el.hasAttribute('data-key'))
}

describe('Keyboard', () => {
  test('marks the next key and lights its finger', () => {
    const { container } = render(
      <Keyboard nextChar="j" allowedKeys={undefined} />,
    )
    expect(key(container, 'j').getAttribute('data-next')).toBe('true')
    expect(
      container.querySelectorAll('[data-key][data-next="true"]'),
    ).toHaveLength(1)
    const active = activeFingers(container)
    expect(active).toHaveLength(1)
    expect(active[0]!.getAttribute('data-finger')).toBe('ri')
  })

  test('marks letter and shift key for a capital', () => {
    const { container } = render(
      <Keyboard nextChar="A" allowedKeys={undefined} />,
    )
    expect(key(container, 'a').getAttribute('data-next')).toBe('true')
    expect(key(container, 'ShiftRight').getAttribute('data-next')).toBe('true')
  })

  test('dims keys not needed for allowed characters', () => {
    const { container } = render(
      <Keyboard nextChar={undefined} allowedKeys=" asdfjklö" />,
    )
    expect(key(container, 'q').getAttribute('data-dim')).toBe('true')
    expect(key(container, 'f').getAttribute('data-dim')).toBe('false')
    expect(key(container, 'Space').getAttribute('data-dim')).toBe('false')
  })

  test('dims nothing without allowedKeys', () => {
    const { container } = render(
      <Keyboard nextChar={undefined} allowedKeys={undefined} />,
    )
    expect(container.querySelectorAll('[data-dim="true"]')).toHaveLength(0)
  })

  test('has nothing next or active without a next character', () => {
    const { container } = render(
      <Keyboard nextChar={undefined} allowedKeys={undefined} />,
    )
    expect(container.querySelectorAll('[data-next="true"]')).toHaveLength(0)
    expect(activeFingers(container)).toHaveLength(0)
  })

  test('is hidden from assistive tech', () => {
    const { container } = render(
      <Keyboard nextChar={undefined} allowedKeys={undefined} />,
    )
    expect(container.firstElementChild!.getAttribute('aria-hidden')).toBe(
      'true',
    )
  })
})
