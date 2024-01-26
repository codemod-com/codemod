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

## Applicability Criteria

MSW version >= 1.0.0

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

[ts-morph](https://github.com/dsherret/ts-morph)

### Estimated Time Saving

5 minutes per occurence

### Owner

[Intuita](https://github.com/codemod-com)

### Links for more info

-   https://mswjs.io/docs/migrations/1.x-to-2.x/#reqpassthrough
