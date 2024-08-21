A codemod that converts named imports of Preact to namespace imports for improved compatibility and consistency.

### Before

```ts
import Preact from 'preact';
```

### After

```ts
import * as preact from 'preact';
```

