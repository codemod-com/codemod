

This codemod assists in removing the use of Fibers from your Meteor codebase, refactoring your code to utilize the modern `async/await` pattern introduced in Meteor v3.

You can find the implementation of this codemod in the Studio [here](https://go.codemod.com/7zbBQE4)
## Fibers Removal

With the release of Meteor v3, Fibers are no longer necessary. The `async/await` syntax provides a cleaner and more modern approach to handling asynchronous operations in your code. This codemod will automatically refactor your code to replace Fibers with `async/await`.

## Example Transformation

### `Future` to `Promise` with `async/await`

**Before:**

```ts
const Future = Npm.require('fibers/future');

function someFunction() {
  const future = new Future();
  someAsyncFunction((error, result) => {
    if (error) {
      future.throw(error);
    } else {
      future.return(result);
    }
  });
  return future.wait();
}
```

**After:**

```ts
async function someFunction() {
  return new Promise((resolve, reject) => {
    someAsyncFunction((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
```

