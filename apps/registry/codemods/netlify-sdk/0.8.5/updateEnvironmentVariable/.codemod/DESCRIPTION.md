# updateEnvironmentVariable

## Description

This codemod changes `updateEnvironmentVariable` to pass an object instead of the separate arguments as required in Netlify SDK v0.8.5.

## Example

### Before

```jsx
updateEnvironmentVariable(accountId, siteId, key, values);
```

### After

```jsx
updateEnvironmentVariable({
	accountId: accountId,
	siteId: siteId,
	key: key,
	values: values,
});
```
