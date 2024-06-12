This codemod replaces openFeature compatible feature flags with a static value provided by the user.

Codemod replaces following SDK calls: `getBooleanValue`, `getStringValue`, `getNumberValue`, `getObjectValue`.

The codemod accepts the following arguments:

- `key`: The key of the feature flag to be replaced.
- `value`: The value to replace the feature flag with.

## Examples

### Before

```ts
const theValue = getBooleanValue("the-key", true).value;

console.log(getBooleanValue("the-key", false))

if (theValue === true) {
    const someVar = useGate("other-gate1")
    const templateVar = `Hello, ${someVar}`
    const concatVar = "Goodbye, " + someVar
}

if (theValue) {
    console.log('theValue is truthy')
}

if (theValue === 3) {
    console.log('value var === 3')
}

const x = theValue ? 1 : 0

if (getBooleanValue("the-key", true).value === true) {
    console.log('obj.value === true')
}

if (getBooleanValue("the-key", true).value) {
    console.log('obj.value is truthy')
}

console.log(getBooleanValue("the-key", true).value)
```

### After

```ts
console.log(true)

const someVar = useGate("other-gate1")
const templateVar = `Hello, ${someVar}`
const concatVar = "Goodbye, " + someVar


console.log('theValue is truthy')

const x = 1;

console.log('obj.value === true')
console.log('obj.value is truthy')

console.log(true)
```

