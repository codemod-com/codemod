This codemod changes `deleteEnvironmentVariables` to pass an object instead of the separate arguments as required in Netlify SDK v0.8.5.

## Before

```jsx
deleteEnvironmentVariables(accountId, siteId, variables);
```

## After

```jsx
deleteEnvironmentVariables({
	accountId: accountId,
	siteId: siteId,
	variables: variables,
});
```