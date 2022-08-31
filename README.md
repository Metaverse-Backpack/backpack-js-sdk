# Bkpk JavaScript SDK

## BasicUsage

```typescript
import Bkpk from '@bkpk/sdk'

const bkpk = new Bkpk('Your Client ID')

// Store these in localStorage or elsewhere for later
const { token, expiresAt } = await bkpk.authorize()

const avatars = await bkpk.getAvatars()
const avatar = await bkpk.getDefaultAvatar()
```
