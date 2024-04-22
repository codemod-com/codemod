Replaces `params` prop passed by react-router with `match.params`.

## Before

```jsx
const PostEdit = ({ params }) => (
	<div>
		<h1>Post {params.id}</h1>
	</div>
);
```

## After

```jsx
const PostEdit = ({ match }) => (
	<div>
		<h1>Post {match.params.id}</h1>
	</div>
);
```
