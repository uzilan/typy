export interface UserSettings {
  /** The user chose to skip level 0 ("Jag kan redan skriva"). */
  skippedLevel0: boolean
  /** Remembered on-screen keyboard choice; unset means use the level's default. */
  showKeyboard?: boolean
}

/** Where the user's settings are kept. Async so a remote backend can implement it. */
export interface SettingsStore {
  /** The stored settings, or the defaults when nothing is stored. */
  get(): Promise<UserSettings>
  /** Merges the patch into the stored settings. */
  update(patch: Partial<UserSettings>): Promise<void>
}
