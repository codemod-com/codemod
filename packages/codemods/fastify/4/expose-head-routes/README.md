This codemod makes exposeHeadRoutes true by default

🚦 **Impact Level**: Minimal

## What Changed

Starting with v4, every GET route will create a sibling HEAD route. You can revert this behavior by setting exposeHeadRoutes: false in the server options.

## Before

```jsx
const fastify = require('fastify')();

fastify.get('/example', (request, reply) => {
    reply.send({ message: 'Hello, World!' });
});

fastify.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

```

## After

```jsx
const fastify = require('fastify')();

fastify.get('/example', (request, reply) => {
    reply.send({ message: 'Hello, World!' });
});
fastify.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

```
