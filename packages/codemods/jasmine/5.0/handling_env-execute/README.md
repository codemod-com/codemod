This codemod migrates `Env.execute` callbacks to await.

## Example

### Before

```ts
try {
    env.execute(null, function () {
        console.log("Test suite finished.");
    });
} catch (e) {
    console.log("Failed to start the test suite.");
}

```

### After

```ts
try {
    await env.execute();
} catch (e) {
    console.log("Failed to start the test suite.");
}

```

