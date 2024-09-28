



This codemod helps remove deprecated functions like `Promise.await` and `Meteor.wrapAsync` from your Meteor codebase, aligning it with the new best practices introduced in Meteor v3.

You can find the implementation of this codemod in the Studio [here](https://go.codemod.com/afcQUhT).

## Removed Functions

In v3, some functions were removed as they no longer make sense in the current context. This codemod will automatically refactor your code to remove these functions:

- **`Promise.await`**: It is no longer necessary. You can use `await` directly in your code.
- **`Meteor.wrapAsync`**: It is no longer necessary. You can use `async/await` directly in your code.

## Example Transformations

### `Promise.await` to `async/await`

**Before:**

```ts
function someFunction() {
  const result = Promise.await(someAsyncFunction());
  return result;
}
```

**After:**

```ts
async function someFunction() {
  const result = await someAsyncFunction();
  return result;
}
```

### `Meteor.wrapAsync` to `async/await`

**Before:**

```ts
const wrappedFunction = Meteor.wrapAsync(someAsyncFunction);

function someFunction() {
  const result = wrappedFunction();
  return result;
}
```

**After:**

```ts
async function someFunction() {
  const result = await someAsyncFunction();
  return result;
}
```
