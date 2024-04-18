This codemod changes `createOrUpdateVariable` to pass an object instead of the separate arguments as required in Netlify SDK v0.8.5.

## Before

```jsx
createOrUpdateVariable(accountId, siteId, key, value);
```

## After

```jsx
createOrUpdateVariable({
	accountId: accountId,
	siteId: siteId,
	key: key,
	values: value,
});
```
