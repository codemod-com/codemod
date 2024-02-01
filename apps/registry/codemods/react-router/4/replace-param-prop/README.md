# Replace params prop

## Description

Replaces `params` prop passed by react-router with `match.params`.

## Example

### Before

```jsx
const PostEdit = ({ params }) => (
	<div>
		<h1>Post {params.id}</h1>
	</div>
);
```

### After

```jsx
const PostEdit = ({ match }) => (
	<div>
		<h1>Post {match.params.id}</h1>
	</div>
);
```

## Applicability Criteria

react-router version 3

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~1 minutes per occurrence

### Owner

[Codemod.com](https://github.com/codemod-com)

### Links for more info
