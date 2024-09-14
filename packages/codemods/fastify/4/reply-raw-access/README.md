This codemod converts reply.res moved to reply.raw.

🚦 **Impact Level**: Minimal

## What Changed
If you previously used the reply.res attribute to access the underlying Request object you will now need to use reply.raw.

## Before

```jsx
fastify.get('/example', (request, reply) => {
    const rawResponse = reply.res;
    rawResponse.writeHead(200, { 'Content-Type': 'text/plain' });
    rawResponse.end('Hello, World!');
});

```

## After

```jsx
fastify.get('/example', (request, reply) => {
    const rawResponse = reply.raw;
    rawResponse.writeHead(200, { 'Content-Type': 'text/plain' });
    rawResponse.end('Hello, World!');
});

```
