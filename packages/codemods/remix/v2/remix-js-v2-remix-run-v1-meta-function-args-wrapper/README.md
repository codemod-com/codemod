In v2, the meta function no longer receives the parentsData argument. This is because meta now has access to all of your route matches via the matches argument, which includes loader data for each match.

### Before

```ts
export function meta(args) {
  const parentData = args.parentsData['routes/parent'];
}
```

### After

```ts
import { getMatchesData } from '@remix-run/v1-meta';

export function meta(args) {
  const matchesData = getMatchesData(args);
  const parentData = matchesData['routes/parent'];
}
```

