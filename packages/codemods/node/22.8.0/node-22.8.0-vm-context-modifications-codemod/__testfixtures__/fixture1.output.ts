const vm = require('node:vm');

// Using vm.constants.DONT_CONTEXTIFY to create a context with an ordinary global object
const context = vm.createContext(vm.constants.DONT_CONTEXTIFY);

// Successfully freezing the global object
vm.runInContext('Object.freeze(globalThis);', context);

// Attempting to modify a variable that doesn't exist
try {
  vm.runInContext('bar = 1; bar;', context);
} catch (e) {
  console.log(e); // Uncaught ReferenceError: bar is not defined
}