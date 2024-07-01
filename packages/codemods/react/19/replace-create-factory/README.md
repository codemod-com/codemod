Replaces deprecated `React.createFactory` method with JSX.

## Example

### Before

```tsx
import { createFactory } from 'react';

const route = createFactory(Route);
```

### After

```tsx
const route = <Route />;
```

