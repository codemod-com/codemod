In msw v2, lifecycle events callback methods have changed their signature. This codemod replaces usages if its arguments with the new ones.

## Before

```ts
server.events.on('request:start', (req, reqId) => {
	doStuff(req, reqId);
});
```

## After

```ts
server.events.on('request:start', ({ request, requestId }) => {
	doStuff(request, requestId);
});
```
