# createOrUpdateVariables

## Description

This codemod changes `createOrUpdateVariables` to pass an object instead of the separate arguments as required in Netlify SDK v0.8.5.

## Example

### Before

```jsx
createOrUpdateVariables(accountId, siteId, variables);
```

### After

```jsx
createOrUpdateVariables({
	accountId: accountId,
	siteId: siteId,
	key: variables,
});
```
