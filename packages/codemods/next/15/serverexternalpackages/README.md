Refactor experimental.serverComponentsExternalPackages to serverExternalPackages

This codemod refactors the next.config.js file to replace the deprecated experimental.serverComponentsExternalPackages option with the stable serverExternalPackages, improving configuration clarity and maintainability.

- Find Configuration Object: Identifies the nextConfig object in the code.

- Property Check: Ensures the presence of the experimental object and its properties that need updating.

- Move and Rename Property: Moves serverComponentsExternalPackages from the experimental object to the root level and renames it to serverExternalPackages.

- Clean Up: Removes the experimental object if it becomes empty after the migration.

### Before

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["package-name"],
  },
};

module.exports = nextConfig;
```

### After

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["package-name"],
};

module.exports = nextConfig;
```
