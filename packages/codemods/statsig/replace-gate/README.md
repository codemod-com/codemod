This codemod replaces Statsig gates with a static value provided by the user.
Codemod replaces following SDK calls `checkGate`, `useGate`;

The codemod accepts the following arguments:

- `key`: The key of the feature flag to be replaced.
- `value`: The value to replace the feature flag with.
- `type`: The type to which the provided value should be cast.

## Example

### Before

```ts
const theValue = useGate("the-gate").value;
const theGate = useGate("the-gate");
const isLoading = useGate("the-gate").isLoading;

console.log('isLoading: ' + isLoading)
console.log(useGate("the-gate"))

if (theValue === true) {
    const someVar = useGate("other-gate1")
    const templateVar = `Hello, ${someVar}`
    const concatVar = "Goodbye, " + someVar
}

if (theGate.value) {
    // Simple Case is true
    console.log('obj var .value is truthy')
}

if (theValue === 3) {
    console.log('value var === 3')
}

const x = theValue ? 1 : 0

if (useGate("the-gate").value === true) {
    console.log('obj.value === true')
}

if (useGate("the-gate").value) {
    console.log('obj.value is truthy')
}

console.log(useGate("the-gate").value)

console.log(useGate("the-gate"))

```

### After

```ts
console.log('isLoading: ' + false)
console.log({
    isLoading: false,
    value: true
})

const someVar = useGate("other-gate1")
const templateVar = `Hello, ${someVar}`
const concatVar = "Goodbye, " + someVar
// Simple Case is true
console.log('obj var .value is truthy')

const x = 1

console.log('obj.value === true')
console.log('obj.value is truthy')

console.log(true)

console.log({
    isLoading: false,
    value: true
})
```

