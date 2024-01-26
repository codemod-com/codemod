# Remove unused feature flags

## Description

This experimental codemod replaces function calls in a for of `await functionName(featureFlagName)`, where:

-   `functionName` is the target function name (default: `isFlagEnabled`),
-   `featureFlagName` is the target feature flag name.

You need to pass these arguments using the Codemod Arguments' settings or using the Intuita CLI.

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
