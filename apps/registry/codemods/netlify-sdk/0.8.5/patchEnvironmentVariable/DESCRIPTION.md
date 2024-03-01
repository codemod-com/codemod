# patchEnvironmentVariable

## Description

This codemod changes `patchEnvironmentVariable` to pass an object instead of the separate arguments as required in Netlify SDK v0.8.5.

## Example

### Before

```jsx
patchEnvironmentVariable(
	accountId,
	siteId,
	key,
	context,
	value,
	contextParameter,
);
```

### After

```jsx
patchEnvironmentVariable({
	accountId: accountId,
	siteId: siteId,
	key: key,
	context: context,
	value: value,
	contextParameter: contextParameter,
});
```
