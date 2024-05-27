# Replace feature flag

## Description

This codemod replaces feature flags with a static value for a given Provider and eliminates dead code after the feature flag replacement.

The codemod accepts the following arguments:

- `key`: The key of the feature flag to be replaced.
- `value`: The value to replace the feature flag with.
- `type`: The type to which the provided value should be cast.
- `Provider`: Implementation of the Provider interface.

## Examples

### Before

```ts
const isDefaulted = useFlag(user, 'simple-case', true);

if (isDefaulted) {
  const a = b;
  c?.forEach((d) => {
    const f = e;
  });
}
```

### After

```ts
  const a = b;
  c?.forEach((d) => {
    const f = e;
  });
```

