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
