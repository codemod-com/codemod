console.log('isDefaulted: ' + true)
console.log({
    key: "simple-case",
    value: {
        foo: {
            bar: null,
            baz: "str",
            faz: 12
        }
    },
    defaultValue: {
        foo: {
            bar: null,
            baz: "str",
            faz: 12
        }
    },
    isDefaulted: true
})

// Simple Case is true
console.log('obj var .value is truthy')

const x = 1

console.log('obj.value is truthy')

console.log(dvcClient.variable(user, SIMPLE_CASE, true).value)

console.log({
    foo: {
        bar: null,
        baz: "str",
        faz: 12
    }
})

function hello() {
    console.log("HELLO")
}