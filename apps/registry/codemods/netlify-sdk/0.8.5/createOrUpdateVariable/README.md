# createOrUpdateVariable

## Description

This codemod changes `createOrUpdateVariable` to pass an object instead of the separate arguments as required in Netlify SDK v0.8.5.

## Example

### Before

```jsx
createOrUpdateVariable(accountId, siteId, key, value);
```

### After

```jsx
createOrUpdateVariable({
	accountId: accountId,
	siteId: siteId,
	key: key,
	values: value,
});
```

## Applicability Criteria

Netlify SDK v0.8.5 or higher.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~3 minutes per occurrence

### Owner

[Intuita](https://github.com/codemod-com)

### Links for more info

-   [Netlify SDK v0.8.5 Release Notes](https://sdk.netlify.com/release-notes/#085)
