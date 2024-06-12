

This codemod will remove manual memoization hooks: `useCallback`, `useMemo` and `memo`. This codemod goes hand in hand with React Compiler.

> Please note that this is not a safe codemod, as the compiler isn't 1-1 with inserting useMemo/useCallback, so there may be some occurrences that need to be kept in order to keep the semantics.

## Example

### Before:

```tsx
import { memo } from 'react';

const MyComponent = ({ name }) => {
	return <div>Hello, {name}!</div>;
};
	  
const MemoizedMyComponent = memo(MyComponent);
```

### After:

```tsx
const MyComponent = ({ name }) => {
	return <div>Hello, {name}!</div>;
};

const MemoizedMyComponent = MyComponent;
```