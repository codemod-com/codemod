Update Fetch Requests to Handle Caching

This codemod refactors fetch requests to handle caching according to new default behaviors. By default, fetch requests are no longer cached. Use the cache option to cache specific requests, or set fetchCache in a layout or page to control caching behavior globally.

- Find Fetch Requests: Identifies fetch requests in the code that need caching adjustments.

- Property Check: Ensures that fetch requests are updated with the cache option where needed and adds the fetchCache option to control global caching.

- Add Caching Configuration: Adds export const fetchCache = 'default-cache' to layouts or pages to cache all requests by default unless overridden.

### Before

```js
// app/layout.js

export default async function RootLayout() {
  const a = await fetch("https://example.com/data"); // Not Cached
  const b = await fetch("https://example.com/another-data", {
    cache: "force-cache",
  }); // Cached

  // ...
}
```

### After

```js
// app/layout.js

// Since this is the root layout, all fetch requests in the app
// that don't set their own cache option will be cached by default.
export const fetchCache = "default-cache";

export default async function RootLayout() {
  const a = await fetch("https://example.com/data"); // Cached
  const b = await fetch("https://example.com/another-data", {
    cache: "no-store",
  }); // Not Cached

  // ...
}
```

### Explanation

- Default Behavior Change: fetch requests are no longer cached by default.
- Opt-in Caching: Use the cache: 'force-cache' option to cache individual fetch requests.
- Global Caching Control: Use export const fetchCache = 'default-cache' in a layout or page to apply caching to all fetch requests that don't specify their own cache options.
