This codemod changes `createEnvironmentVariable` to pass an object instead of the separate arguments as required in Netlify SDK v0.8.5.

## Before

```jsx
createEnvironmentVariable(accountId, siteId, key, values);
```

## After

```jsx
createEnvironmentVariable({
	accountId: accountId,
	siteId: siteId,
	key: key,
	values: values,
});
```
