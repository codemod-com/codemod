const a = __CODEMOD_LITERAL__({
    key: "simple-case",
    value: "string",
    defaultValue: "string",
    isDefaulted: true
}).value;
const b = __CODEMOD_LITERAL__({
    key: "simple-case",
    value: "string1",
    defaultValue: "string",
    isDefaulted: true
})['isDefaulted'];

const c = __CODEMOD_LITERAL__({
    key: "simple-case",
    value: "string1",
    defaultValue: "string",
    isDefaulted: true
})

const shouldRender = x && c['value'];
