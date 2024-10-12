Using the metaV1 function, you can pass in the meta function's arguments and the same object it currently returns. This function will use the same merging logic to merge the leaf route's meta with its direct parent route meta before converting it to an array of meta descriptors usable in v2.

### Before

```ts
export function meta() {
  return {
    title: '...',
    description: '...',
    'og:title': '...',
  };
}
```

### After

```ts
import { metaV1 } from '@remix-run/v1-meta';

export function meta(args) {
  return metaV1(args, {
    title: '...',
    description: '...',
    'og:title': '...',
  });
}
```

