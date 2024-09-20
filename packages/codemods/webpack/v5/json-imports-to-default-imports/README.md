This codemod migrates imports from JSON modules that use named exports to use default exports instead.

It replaces code like `import { version } from './package.json'; console.log(version);` with `import pkg from './package.json'; console.log(pkg.version);`.


## Example

### Before

```ts
import { version } from './package.json';
console.log(version);
```

### After

```ts
import pkg from './package.json';
console.log(pkg.version);
```
,

### Before

```ts
import { version, name, description } from './package.json';
console.log(version, name, description);
```

### After

```ts
import pkg from './package.json';
console.log(pkg.version, pkg.name, pkg.description);
```
,

### Before

```ts
import { nested, nested2 } from './data.json';
console.log(nested.property, nested2.property);
```

### After

```ts
import pkg from './data.json';
console.log(pkg.nested.property, pkg.nested2.property);
```

