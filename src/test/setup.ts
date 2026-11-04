import '@testing-library/jest-dom/vitest'

// jsdom has no matchMedia; default to light. Tests may override it.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }) as unknown as MediaQueryList
}
