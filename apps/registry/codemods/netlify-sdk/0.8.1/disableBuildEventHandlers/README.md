# Rename disableBuildEventHandlers

## Description

This codemod renames `disableBuildhook` to `disableBuildEventHandlers` as required in Netlify SDK v0.8.1.

## Example

### Before

```jsx
await client.disableBuildhook(siteId);
```

### After

```jsx
await client.disableBuildEventHandlers(siteId);
```

## Applicability Criteria

Netlify SDK v0.8.1 or higher.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~1 minutes per occurrence

### Owner

[Intuita](https://github.com/codemod-com)

### Links for more info

-   [Netlify SDK v0.8.1 Release Notes](https://sdk.netlify.com/release-notes/#081)
