# Replace forwardRef with ref prop

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
