# DevCycle/replace-feature-flag

## Description

This codemod replaces DevCycle feature flags with a static value provided by the user.
It replaces following SDK method calls:  `variable`, `variableValue`, `useVariable`, `useDVCVariable`, `useVariableValue`.

The codemod accepts the following arguments:

- `key`: The key of the feature flag to be replaced.
- `value`: The value to replace the feature flag with.
- `type`: The type to which the provided value should be cast.

## Examples

### Before

```ts
const simpleCaseValue = dvcClient.variable(user, "simple-case", true).value
const simpleCase = dvcClient.variable(user, "simple-case", true)
const isDefaulted = dvcClient.variable(user, "simple-case", true).isDefaulted

console.log('isDefaulted: ' + isDefaulted)
console.log(dvcClient.variable(user, "simple-case", true))

if (simpleCaseValue === true) {
    const someVar = dvcClient.variable(user, "some-var", "stringy")
    const templateVar = `Hello, ${someVar}`
    const concatVar = "Goodbye, " + someVar
}

if (simpleCase.value) {
    // Simple Case is true
    console.log('obj var .value is truthy')
}

if (simpleCaseValue === 3) {
    console.log('value var === 3')
}

const x = simpleCaseValue ? 1 : 0

if (dvcClient.variable(user, "simple-case", true).value === true) {
    console.log('obj.value === true')
}

if (dvcClient.variable(user, "simple-case", true).value) {
    console.log('obj.value is truthy')
}

console.log(dvcClient.variable(user, SIMPLE_CASE, true).value)

console.log(useVariableValue("simple-case", true))

function hello() {
    console.log("HELLO")
    dvcClient.variable(user, "simple-case", true).onUpdate((value) => {
        heroText.innerHTML = value
    })
}
```

### After

```ts
console.log('isDefaulted: ' + true)
console.log({
    key: "simple-case",
    value: true,
    defaultValue: true,
    isDefaulted: true
})

const someVar = dvcClient.variable(user, "some-var", "stringy")
const templateVar = `Hello, ${someVar}`
const concatVar = "Goodbye, " + someVar
// Simple Case is true
console.log('obj var .value is truthy')

const x = 1

console.log('obj.value === true')
console.log('obj.value is truthy')

console.log(dvcClient.variable(user, SIMPLE_CASE, true).value)

console.log(true)

function hello() {
    console.log("HELLO")
}

```

