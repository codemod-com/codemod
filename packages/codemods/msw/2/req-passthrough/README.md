# Replace printHandlers() calls

## Description

A new way of calling a passthrough is available in msw v2. This codemod replaces `req.passthrough()` calls with the new way of doing that using exported function.

## Example

### Before

```ts
rest.get('/resource', (req, res, ctx) => {
	return req.passthrough();
});
```

### After

```ts
import { passthrough } from 'msw';

rest.get('/resource', (req, res, ctx) => {
	return passthrough();
});
```
