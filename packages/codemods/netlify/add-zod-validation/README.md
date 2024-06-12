This codemod adds zod validation to query parsing.

## Example

### Before

```ts
const query = buildQuery(props.location?.search ?? '');
const someParam = query?.['some-param'] === 'true';
```

### After

```ts
import { z } from 'zod';
const querySchema = z.object({
  'some-param': z.string(),
});
const query = buildQuery(props.location?.search ?? '');
const parsedQuery = querySchema.parse(query);
const someParam = parsedQuery['some-param'] === 'true';
```

