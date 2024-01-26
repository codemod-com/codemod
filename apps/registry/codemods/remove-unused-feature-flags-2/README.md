# Remove unused feature flags 2

## Description

This experimental codemod replaces function calls in a form of `await functionName()`, based on the following arguments:

-   `fileMarker` is the marker of files that contain feature flag builders,
-   `functionName` is the name of the feature flag builder function,
-   `featureFlagName` is the target feature flag name.

You need to pass these arguments using the Codemod Arguments' settings or using the Intuita CLI.

## Example

### Before:

```tsx
export async function Component() {
	const a = await featureFlagObject();
}
```

### After:

```tsx
export async function Component() {
	const a = true;
}
```

## Applicability Criteria

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~5 minutes per occurrence

### Owner

Intuita

### Links for more info
