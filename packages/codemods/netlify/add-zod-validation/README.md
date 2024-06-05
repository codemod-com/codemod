Add zod validation to query parsing.

## Examples

### Before

```ts
const query = buildQuery(props.location?.search ?? '');
const openCustomizeSiteName = query?.['customize-site-name'] === 'true';
```

### After

```ts
import { z } from 'zod';
const querySchema = z.object({
  'customize-site-name': z.string(),
});
const query = buildQuery(props.location?.search ?? '');
const parsedQuery = querySchema.parse(query);
const openCustomizeSiteName = parsedQuery['customize-site-name'] === 'true';

```

