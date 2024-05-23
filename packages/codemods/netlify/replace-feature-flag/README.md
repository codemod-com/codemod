# Netlify / replace feature flag

## Description

This codemod replaces feature flags with a static value provided by the user.
Codemod replaces `useFlag` hook calls.

The codemod accepts the following arguments:

- `key`: The key of the feature flag to be replaced.
- `value`: The value to replace the feature flag with.
- `type`: The type to which the provided value should be cast.

## Description

## Examples

### Before

```ts
const theValue = useFlag("the-gate").value;


if (theValue) {
    // Simple Case is true
    console.log('theValue is truthy')
}

if (theValue === 3) {
    console.log('value var === 3')
}

const x = theValue ? 1 : 0
```

### After

```ts
// Simple Case is true
console.log('theValue is truthy')

const x = 1;
```

