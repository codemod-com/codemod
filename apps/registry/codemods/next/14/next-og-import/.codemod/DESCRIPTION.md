# Next OG Import

## Description

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

## Applicability Criteria

Next.js version higher or equal to 14.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~5 minutes per occurrence

### Owner

[Vercel](https://github.com/vercel)

### Links for more info

-   [Migrate `ImageResponse` imports](https://nextjs.org/docs/pages/building-your-application/upgrading/codemods#migrate-imageresponse-imports)
