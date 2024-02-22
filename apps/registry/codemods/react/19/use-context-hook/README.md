# Change useContext usage to use hook

## Description

This codemod will convert the usage of `useContext` to the new hook format, introduced in React v19.

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

