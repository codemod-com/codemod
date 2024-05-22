
const a = useVariableValue(user, 'simple-case', 'string1');
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
