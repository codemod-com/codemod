# Change useContext usage to use hook

## Description

This codemod will convert the usage of `useContext` to the new hook format, introduced in React v19.

## Example

### Before:

```tsx
import { useContext } from "react";
import ThemeContext from "./ThemeContext";

const theme = useContext(ThemeContext);
```

### After:

```tsx
import { use } from "react";
import ThemeContext from "./ThemeContext";

const theme = use(ThemeContext);
```
