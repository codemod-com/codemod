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

## Applicability Criteria

React <=18

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

[Codemod.com](https://github.com/codemod-com)

### Links for more info

- https://react.dev/reference/react/use#reading-context-with-use