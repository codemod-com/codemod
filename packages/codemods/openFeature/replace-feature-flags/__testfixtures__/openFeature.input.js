const theValue = getBooleanValue("the-key", true);

console.log(getBooleanValue("the-key", false))

if (theValue === true) {
    const someVar = getBooleanValue("other-key")
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

if (getBooleanValue("the-key", true) === true) {
    console.log('obj.value === true')
}

if (getBooleanValue("the-key", true)) {
    console.log('obj.value is truthy')
}

console.log(getBooleanValue("the-key", true))

