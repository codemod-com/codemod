Configure staleTimes in next.config.js

This guide refactors the next.config.js file to introduce staleTimes configuration options for controlling cache durations of page segments, enhancing caching behavior and performance.

- Find Configuration Object: Identifies the nextConfig object in the code.

- Add staleTimes Property: Adds the staleTimes property to the experimental object, specifying cache durations for dynamic and static pages.

- Specify Cache Durations: Defines the cache duration for dynamic and static pages in seconds.

- Clean Up: Removes the experimental object if it becomes empty after the migration.

### Before

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Existing experimental properties
  },
};

module.exports = nextConfig;
```

### After

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30, // Cache dynamic pages for 30 seconds
      static: 180, // Cache static pages for 180 seconds
    },
  },
};

module.exports = nextConfig;
```
