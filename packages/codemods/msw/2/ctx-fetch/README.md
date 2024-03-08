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
