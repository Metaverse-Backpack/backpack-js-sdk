## Backpack Bus Integration

```typescript
import { BkpkBus} from '@bkpk/sdk'

// On Window Load
const bus = new BkpkBus()
const { clientId, responseType, scopes, state } = bus

// When an error occurs
bus.error('Error Message', { ...errorDetails? })

// If the user cancels the authorization
bus.close()

// Log something in the consumer window
bus.debug(...anything)

// When the user authorizes the app (w/ token grant)
bus.result('token', { expires: new Date('expiration date'), token: 'XXX' })

// When the user authorizes the app (w/ code grant)
bus.result('code', { code: 'XXX' })
```
