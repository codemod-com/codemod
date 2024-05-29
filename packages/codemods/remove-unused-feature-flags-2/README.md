

This experimental codemod replaces function calls in a form of `await functionName()`, based on the following arguments:

-   `fileMarker` is the marker of files that contain feature flag builders,
-   `functionName` is the name of the feature flag builder function,
-   `featureFlagName` is the target feature flag name.

You need to pass these arguments using the Codemod Arguments' settings or using the Codemod CLI.

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