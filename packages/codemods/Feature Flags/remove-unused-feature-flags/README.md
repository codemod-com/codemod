# Remove unused feature flags

## Description

This experimental codemod replaces function calls in a for of `await functionName(featureFlagName)`, where:

-   `functionName` is the target function name (default: `isFlagEnabled`),
-   `featureFlagName` is the target feature flag name.

You need to pass these arguments using the Codemod Arguments' settings or using the Codemod CLI.

## Example

### Before:

```tsx
const [a, b] = await Promise.all([
	Promise.resolve('a'),
	isFlagEnabled('featureFlag'),
]);

const x = b && c;

const y = <A b={b} />;
```

### After:

```tsx
const a = await Promise.resolve('a');

const x = c;

const y = <A b={true} />;
```