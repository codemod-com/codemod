This codemod helps to improve error reporting in route definitions, route registration is now synchronous, so if you specify an onRoute hook in a plugin, you should now use await.register() 

## What Changed

To improve error reporting in route definitions, route registration is now synchronous. As a result, if you specify an onRoute hook in a plugin you should now use await.register()


## Before

```jsx
fastify.register((instance, opts, done) => {
    instance.addHook('onRoute', (routeOptions) => {
        const { path, method } = routeOptions;
        console.log({ path, method });
    });
    done();
});
```

## After

```jsx
await fastify.register((instance, opts, done) => {
    instance.addHook('onRoute', (routeOptions) => {
        const { path, method } = routeOptions;
        console.log({ path, method });
    });
    done();
});
```
