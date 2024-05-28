# Remove forward ref
## Description

React.forwardRef will be deprecated for Function Components in near future. This codemod removes forwardRef function.

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
