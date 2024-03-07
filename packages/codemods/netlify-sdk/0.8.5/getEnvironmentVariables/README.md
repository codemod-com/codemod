# getEnvironmentVariables

## Description

This codemod changes `getEnvironmentVariables` to pass an object instead of the separate arguments as required in Netlify SDK v0.8.5.

## Example

### Before

```jsx
getEnvironmentVariables(accountId, siteId);
```

### After

```jsx
getEnvironmentVariables({
	accountId: accountId,
	siteId: siteId,
});
```
