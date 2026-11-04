import { defineConfig } from 'vitest/config'

// Tests that need the Firebase emulators: npm run test:emulator
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.emulator.test.ts'],
    // One shared emulator; run files one after another.
    fileParallelism: false,
  },
})
