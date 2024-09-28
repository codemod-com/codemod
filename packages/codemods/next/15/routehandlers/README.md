Update Route Handlers to Handle Caching

This codemod refactors Route Handlers to manage caching behavior for GET functions. By default, GET methods are no longer cached. This codemod updates your Route Handler files to use the dynamic configuration option to opt specific routes into caching.

- Find Route Handlers: Identifies GET functions in the Route Handler files.

- Property Check: Ensures the presence of GET functions and adds the dynamic configuration option if necessary.

- Add Caching Configuration: Adds export const dynamic = 'force-static' to enable caching for GET methods.

- Clean Up: Removes the experimental object if it becomes empty after the migration.

### Before

```js
// app/api/route.js

export async function GET() {
  // Handler logic
}
```

### After

```js
// app/api/route.js

// Use this option to cache the GET method response
export const dynamic = "force-static";

export async function GET() {
  // Handler logic
}
```
