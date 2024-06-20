console.log('isLoading: ' + false);
console.log({
	isLoading: false,
	value: true,
});

let someVar = useGate('other-gate1');
let templateVar = `Hello, ${someVar}`;
let concatVar = 'Goodbye, ' + someVar;
// Simple Case is true
console.log('obj var .value is truthy');

let x = 1;

console.log('obj.value === true');
console.log('obj.value is truthy');

console.log(true);

console.log({
	isLoading: false,
	value: true,
});
