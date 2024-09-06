In your remix.config.js, rename browserBuildDirectory to assetsBuildDirectory.
### Before

```ts
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  browserBuildDirectory: './public/build',
};
```

### After

```ts
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  assetsBuildDirectory: './public/build',
};
```

