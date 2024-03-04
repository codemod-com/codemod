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
