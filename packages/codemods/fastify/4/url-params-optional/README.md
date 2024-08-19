This codemod  declares the optional parameters explicitly.

🚦 **Impact Level**: Minimal

## What Changed

If you've already used any implicitly optional parameters, you'll get a 404 error when trying to access the route. You will now need to declare the optional parameters explicitly.


## Before

```jsx
fastify.get('/posts/:id', (request, reply) => {
    const { id } = request.params;
});

```

## After

```jsx
fastify.get('/posts/:id?', (request, reply) => {
    const { id } = request.params;
});

```
