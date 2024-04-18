Codemod to convert React PropTypes to TypeScript types.

-   Supports function and class components
-   Supports `static propTypes` declarations on class components
-   Supports [`forwardRef`s](https://reactjs.org/docs/forwarding-refs.html)
-   Supports files with multiple components
-   Copies JSDoc comments to the generated TypeScript types
-   Option to remove or preserve PropTypes after converting to TS

## Before:

```jsx
import PropTypes from 'prop-types';
import React from 'react';

export function MyComponent(props) {
	return <span />;
}

MyComponent.propTypes = {
	bar: PropTypes.string.isRequired,
	foo: PropTypes.number,
};
```

## After:

```tsx
import React from 'react';

interface MyComponentProps {
	bar: string;
	foo?: number;
}

export function MyComponent(props: MyComponentProps) {
	return <span />;
}
```