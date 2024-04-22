This codemod will convert the usage of `useContext` to the new hook format, introduced in React v19.

## Before:

```tsx
import { useContext } from "react";
import UseTheme from "./UseTheme";

const theme = useContext(UseTheme);
```

## After:

```tsx
import { use } from "react";
import UseTheme from "./UseTheme";

const theme = use(UseTheme);
```
