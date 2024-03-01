# Replace ctx.fetch() calls

## Description

`ctx.fetch(req)` is now meant to be called as `fetch(bypass(req))` where `bypass` is a new function available in the `msw` library. Changes applied by this codemod:

-   `ctx.fetch(req)` is replaced with `fetch(bypass(req))`.

NOTE: The `bypass` call is meant to wrap the new `request` object available on the callback argument. This object is not being destructured in this codemod, so you will have to do it manually or run a `callback-signature` codemod that will do that and replace the reference for you.

## Example

### Before

```ts
import { rest } from 'msw';

const handlers: RestHandler[] = [
	rest.get('/user', async (req, res, ctx) => {
		const originalRequest = await ctx.fetch(req);

		return res(ctx.json({ firstName: 'John' }));
	}),
];
```

### After

```ts
import { rest } from 'msw';

const handlers: RestHandler[] = [
	rest.get('/user', async (req, res, ctx) => {
		const originalRequest = await fetch(bypass(req));

		return res(ctx.json({ firstName: 'John' }));
	}),
];
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

5 minutes per occurrence

### Owner

[Codemod.com](https://github.com/codemod-com)

### Links for more info

-   https://mswjs.io/docs/migrations/1.x-to-2.x/#ctxfetch
