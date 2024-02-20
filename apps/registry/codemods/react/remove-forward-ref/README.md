# Replace React FC Typescript

## Description

React.forwardRef will be deprecated for Function Components in near future. This codemod removes forwardRef function.

## Example

### Before:

```jsx
import { forwardRef } from 'react';

const MyInput = forwardRef(function MyInput(props, ref) {
	// ...
});
```

### After:

```tsx
const MyInput = function MyInput({ ref, ...otherProps }) {
	// ...
};
```

## Applicability Criteria

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~5 minutes per occurrence

### Owner

[Codemod.com](https://github.com/codemod-com)

### Links for more info
