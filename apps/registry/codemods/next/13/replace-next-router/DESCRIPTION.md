# Replace Next Router

## Description

Since Next.js 13.4, you can use the following hooks from the `next/navigation` module:

-   `useRouter`,
-   `useSearchParams`,
-   `usePathname`,
-   `useParams`.

These hooks replace the functionality available in the `useRouter` hook in the `next/hook` module, however, the behavior is distinct.

This codemod allows you to migrate the `useRouter` hook to the new `useRouter` hook imported from `next/navigation`. This includes all usages of the `useRouter` hook which may be replaced with `useSearchParams` and `usePathname`.

## Example

### Before

```tsx
import { useRouter } from 'next/router';

function Component() {
	const { query } = useRouter();
	const { a, b, c } = query;
}
```

### After

```tsx
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

function Component() {
	const params = useParams();
	const searchParams = useSearchParams();
	const getParam = useCallback(
		(p: string) => params?.[p] ?? searchParams?.get(p),
		[params, searchParams],
	);

	const a = getParam('a');
	const b = getParam('b');
	const c = getParam('c');
}
```

## Applicability Criteria

Next.js version is greater or equal to 13.4.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

[ts-morph](https://github.com/dsherret/ts-morph)

### Estimated Time Saving

~5 minutes per occurrence

### Owner

[Codemod.com](https://github.com/codemod-com)
