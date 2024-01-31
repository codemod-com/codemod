# Replace lifecycle events callback signature [BETA]

## Description

In msw v2, lifecycle events callback methods have changed their signature. This codemod replaces usages if its arguments with the new ones.

## Example

### Before

```ts
server.events.on('request:start', (req, reqId) => {
	doStuff(req, reqId);
});
```

### After

```ts
server.events.on('request:start', ({ request, requestId }) => {
	doStuff(request, requestId);
});
```

## Applicability Criteria

MSW version >= 1.0.0

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

[ts-morph](https://github.com/dsherret/ts-morph)

### Estimated Time Saving

5 minutes per occurrence

### Owner

[Codemod.com](https://github.com/codemod-com)

### Links for more info

-   https://mswjs.io/docs/migrations/1.x-to-2.x/#life-cycle-events
