Node.js implements a flavor of vm.createContext() and friends that creates a context without contextifying its global object when vm.constants.DONT_CONTEXTIFY is used. This is suitable when users want to freeze the context (impossible when the global is contextified i.e. has interceptors installed) or speed up the global access if they don't need the interceptor behavior.


### Before

```ts
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
```

### After

```ts
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
```

