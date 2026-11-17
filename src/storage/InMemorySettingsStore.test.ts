import { describeSettingsStore } from './settingsStoreContract'
import { InMemorySettingsStore } from './InMemorySettingsStore'

describeSettingsStore(
  'InMemorySettingsStore',
  () => new InMemorySettingsStore(),
)
