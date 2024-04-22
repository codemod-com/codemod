This codemod moves transforms imports from `next/server` to `next/og` for usage of [Dynamic OG Image Generation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata#dynamic-image-generation).

## Example

### Before

```jsx
import { ImageResponse } from 'next/server';
```

### After

```jsx
import { ImageResponse } from 'next/og';
```
