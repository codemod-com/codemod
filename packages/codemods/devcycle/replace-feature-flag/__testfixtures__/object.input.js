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