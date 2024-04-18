This codemod replaces instances of `location.query` with `parse(location.search)`, where `parse` is a function imported from `query-string`.

## Before

```jsx
const List = ({ location }) => (
	<div>
		<h1>{location.query.sort}</h1>
	</div>
);
```

## After

```jsx
import { parse } from 'query-string';

const List = ({ location }) => (
	<div>
		<h1>{parse(location.search).sort}</h1>
	</div>
);
```
