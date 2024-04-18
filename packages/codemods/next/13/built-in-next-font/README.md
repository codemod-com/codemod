This codemod transforms the module specifier `@next/font/*` in import statements into `next/font/*`.

Using the `@next/font/*` modules is deprecated since Next.js v13.2.

## Example

### Before

```jsx
import { Inter } from '@next/font/google';
```

### After

```jsx
import { Inter } from 'next/font/google';
```