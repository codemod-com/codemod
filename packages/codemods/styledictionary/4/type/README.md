## What Changed

This codemod introduces strict typing across Style Dictionary, with `.d.ts` files published alongside each file. Importing from Style Dictionary’s entrypoints now automatically provides implicit types, offering significant improvements for TypeScript users with more accurate and fewer `any` types. Specific type interfaces can still be imported separately from the `style-dictionary/types` entrypoint if needed.

## Before

```jsx
import StyleDictionary from 'style-dictionary';
declare type DesignToken = StyleDictionary.DesignToken;
declare type Transform = StyleDictionary.Transform;
```

## After

```jsx
import type { DesignToken, Transform } from 'style-dictionary/types';
```
