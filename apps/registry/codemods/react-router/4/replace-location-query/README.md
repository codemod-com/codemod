# Replace Location Query

## Description

This codemod replaces instances of `location.query` with `parse(location.search)`, where `parse` is a function imported from `query-string`.

## Example

### Before

```jsx
const List = ({ location }) => (
	<div>
		<h1>{location.query.sort}</h1>
	</div>
);
```

### After

```jsx
import { parse } from 'query-string';

const List = ({ location }) => (
	<div>
		<h1>{parse(location.search).sort}</h1>
	</div>
);
```

## Applicability Criteria

React Router version 3.x.y

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~3 minutes per occurrence

### Owner

[Codemod.com](https://codemod.com)
