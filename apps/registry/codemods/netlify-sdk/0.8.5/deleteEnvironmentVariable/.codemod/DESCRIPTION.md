# deleteEnvironmentVariable

## Description

This codemod changes `deleteEnvironmentVariable` to pass an object instead of the separate arguments as required in Netlify SDK v0.8.5.

## Example

### Before

```jsx
deleteEnvironmentVariable(accountId, siteId, key);
```

### After

```jsx
deleteEnvironmentVariable({
	accountId: accountId,
	siteId: siteId,
	key: key,
});
```
