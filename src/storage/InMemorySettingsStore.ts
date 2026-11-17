import type { SettingsStore, UserSettings } from './SettingsStore'

/** Keeps settings in memory; lost on page reload. */
export class InMemorySettingsStore implements SettingsStore {
  private settings: UserSettings = { skippedLevel0: false }

  async get(): Promise<UserSettings> {
    return { ...this.settings }
  }

  async update(patch: Partial<UserSettings>): Promise<void> {
    this.settings = { ...this.settings, ...patch }
  }
}
