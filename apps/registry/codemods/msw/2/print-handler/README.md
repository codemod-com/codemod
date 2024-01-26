# Replace printHandlers() calls

## Description

A new way of listing all handlers is preferred in msw v2. This codemod replaces `printHandlers()` calls with the new way of doing that.

## Example

### Before

```ts
worker.printHandlers();
```

### After

```ts
worker.listHandlers().forEach((handler) => {
	console.log(handler.info.header);
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

[Intuita](https://github.com/codemod-com)

### Links for more info

-   https://mswjs.io/docs/migrations/1.x-to-2.x/#printhandlers
