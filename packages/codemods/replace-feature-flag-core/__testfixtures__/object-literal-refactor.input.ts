let a = useFlag(user, 'simple-case', 'string1');
let b = __CODEMOD_LITERAL__({
	key: 'simple-case',
	value: 'string1',
	defaultValue: 'string',
	isDefaulted: true,
})['isDefaulted'];

let c = __CODEMOD_LITERAL__({
	key: 'simple-case',
	value: 'string1',
	defaultValue: 'string',
	isDefaulted: true,
});

let shouldRender = x && c['value'];
