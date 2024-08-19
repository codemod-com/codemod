This codemod wrap your routes in a plugin

🚦 **Impact Level**: Minimal

## What Changed

To improve error reporting in route definitions, route registration is now synchronous. As a result, if you specify an onRoute hook in a plugin you should wrap your routes in a plugin.

## Before

```jsx
fastify.register((instance, opts, done) => {
  instance.addHook('onRoute', (routeOptions) => {
    const { path, method } = routeOptions;
    console.log({ path, method });
    done();
  });
});

fastify.get('/', (request, reply) => { reply.send('hello') });
```

## After

```jsx
fastify.register((instance, opts, done) => {
  instance.addHook('onRoute', (routeOptions) => {
    const { path, method } = routeOptions;
    console.log({ path, method });
    done();
  });
});

fastify.register((instance, opts, done) => {
  instance.get('/', (request, reply) => { reply.send('hello') });
  done();
});
```
