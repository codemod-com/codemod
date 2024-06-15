let theValue = useGate('the-gate').value;
let theGate = useGate('the-gate');
let isLoading = useGate('the-gate').isLoading;

console.log('isLoading: ' + isLoading);
console.log(useGate('the-gate'));

if (theValue === true) {
	let someVar = useGate('other-gate1');
	let templateVar = `Hello, ${someVar}`;
	let concatVar = 'Goodbye, ' + someVar;
}

if (theGate.value) {
	// Simple Case is true
	console.log('obj var .value is truthy');
}

if (theValue === 3) {
	console.log('value var === 3');
}

let x = theValue ? 1 : 0;

if (useGate('the-gate').value === true) {
	console.log('obj.value === true');
}

if (useGate('the-gate').value) {
	console.log('obj.value is truthy');
}

console.log(useGate('the-gate').value);

console.log(useGate('the-gate'));
