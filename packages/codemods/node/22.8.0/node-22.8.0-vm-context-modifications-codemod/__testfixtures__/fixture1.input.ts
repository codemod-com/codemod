const vm = require('node:vm');

// Creating a context with a contextified global object
const context = vm.createContext();

// Attempting to freeze the global object
try {
  vm.runInContext('Object.freeze(globalThis);', context);
} catch (e) {
  console.log(e); // TypeError: Cannot freeze
}

// Accessing global variables
console.log(vm.runInContext('globalThis.foo = 1; foo;', context)); // 1