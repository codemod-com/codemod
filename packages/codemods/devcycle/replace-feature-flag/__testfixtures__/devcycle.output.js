console.log('isDefaulted: ' + true);
console.log({
	key: 'simple-case',
	value: true,
	defaultValue: true,
	isDefaulted: true,
});

let someVar = dvcClient.variable(user, 'some-var', 'stringy');
let templateVar = `Hello, ${someVar}`;
let concatVar = 'Goodbye, ' + someVar;
// Simple Case is true
console.log('obj var .value is truthy');

let x = 1;

console.log('obj.value === true');
console.log('obj.value is truthy');

console.log(dvcClient.variable(user, SIMPLE_CASE, true).value);

console.log(true);

function hello() {
	console.log('HELLO');
}
