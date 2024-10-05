Like useNavigation, useFetcher has flattened the submission and removed the type field.

### Before

```ts
import { useFetcher } from '@remix-run/react';

function SomeComponent() {
  const fetcher = useFetcher();
  fetcher.submission.formData;
  fetcher.submission.formMethod;
  fetcher.submission.formAction;
  fetcher.type;
}
```

### After

```ts
import { useFetcher } from '@remix-run/react';

function SomeComponent() {
  const fetcher = useFetcher();

  // these keys are flattened
  fetcher.formData;
  fetcher.formMethod;
  fetcher.formAction;

  // this key is removed
  fetcher.type;
}
```

