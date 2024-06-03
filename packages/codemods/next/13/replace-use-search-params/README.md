A recent update in Next.js brought a breaking change: the `useSearchParams` hook no longer includes `params`. To ease the migration, the new `useCompatSearchParams` hook can be used. This hook mimics the behavior of the old `useSearchParams` in two ways:

- it includes both `params` and `searchParams`
- `params` overwrite any conflicting values in `searchParams`

## Example

### Before

```jsx
import { useSearchParams } from 'next/navigation';

export async function Component() {
 const params = useSearchParams();
 return <div>My Component</div>;
}
```

### After

```jsx
import { useCompatSearchParams } from 'hooks/utils';

export async function Component() {
 const params = useCompatSearchParams();

 return <div>My Component</div>;
}
```
