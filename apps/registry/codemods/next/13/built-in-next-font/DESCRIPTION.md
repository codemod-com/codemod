# Built in Next Font

## Description

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

## Applicability Criteria

-   Next.js version higher or equal to 13.2.
-   This codemod requires you to use `@next/font/*` module specifier in import statements.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

[jscodeshift](https://github.com/facebook/jscodeshift)

### Estimated Time Saving

~30 seconds per occurrence

### Owner

[Vercel](https://github.com/vercel)

### Links for more info

-   https://nextjs.org/docs/pages/building-your-application/upgrading/codemods#use-built-in-font
