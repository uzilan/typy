import { describeAttemptStore } from './attemptStoreContract'
import { InMemoryAttemptStore } from './InMemoryAttemptStore'

describeAttemptStore('InMemoryAttemptStore', () => new InMemoryAttemptStore())
