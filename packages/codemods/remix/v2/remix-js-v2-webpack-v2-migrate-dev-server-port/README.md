In your remix.config.js, rename devServerPort to future.v2_dev.port.

### Before

```ts
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  devServerPort: 8002,
};
```

### After

```ts
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  // While on v1.x, this is via a future flag
  future: {
    v2_dev: {
      port: 8002,
    },
  },
};
```

