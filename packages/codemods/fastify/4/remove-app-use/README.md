This codemod removes app.use()  and the use of middleware is no longer supported.

🚦 **Impact Level**: Minimal

## What Changed

With v4 of Fastify, app.use() has been removed and the use of middleware is no longer supported.

If you need to use middleware, use @fastify/middie or @fastify/express, which will continue to be maintained. However, it is strongly recommended that you migrate to Fastify's hooks.


## Before

```jsx
const fastify = require('fastify')();

fastify.use((req, res, next) => {
    console.log('Middleware executed');
    next();
});

fastify.get('/example', (req, res) => {
    res.send('Hello, World!');
});

fastify.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

```

## After

```jsx
const fastify = require('fastify')();
const middie = require('@fastify/middie');

fastify.register(middie);

fastify.use((req, res, next) => {
    console.log('Middleware executed');
    next();
});

fastify.get('/example', (req, res) => {
    res.send('Hello, World!');
});

fastify.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

```
