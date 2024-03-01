# Migrate prop types to typescript

## Description

Codemod to convert React PropTypes to TypeScript types.

-   Supports function and class components
-   Supports `static propTypes` declarations on class components
-   Supports [`forwardRef`s](https://reactjs.org/docs/forwarding-refs.html)
-   Supports files with multiple components
-   Copies JSDoc comments to the generated TypeScript types
-   Option to remove or preserve PropTypes after converting to TS

## Example

### Before:

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

### After:

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

## Applicability Criteria

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~30 minutes per occurrence

### Owner

[Mark Skelton](https://github.com/mskelton/ratchet)

### Links for more info

-   [Ratchet Codemod](https://github.com/mskelton/ratchet)
