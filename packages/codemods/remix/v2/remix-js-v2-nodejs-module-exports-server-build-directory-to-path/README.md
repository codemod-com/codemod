In your remix.config.js, rename serverBuildDirectory to serverBuildPath and specify a module path, not a directory.

### Before

```ts
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverBuildDirectory: './build',
};
```

### After

```ts
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverBuildPath: './build/index.js',
};
```

