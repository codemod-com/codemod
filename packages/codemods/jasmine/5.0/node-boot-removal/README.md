This codemod remove `node_boot.js` as it is no longer supported in jasmin 5.0


## Example

### Before

```ts
const boot = require('jasmine-core/node_boot.js');
```

### After

```ts
const boot = require('jasmine-core').boot;
```

