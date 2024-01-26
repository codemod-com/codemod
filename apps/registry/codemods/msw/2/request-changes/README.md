# Apply request changes

## Description

Following the original msw upgrade guide, the signature of the request handler have changed. Some of the parameters have changed their type, some widely used objects are available directly on the callback argument object for convenience. Following changes are applied by this codemod:

-   `req.url` is now obtained as `new URL(request.url)`, request being a new object available for destructure from the single callback argument
-   `req.params` are now exposed in the same callback argument
-   `req.cookies` are now exposed in the same callback argument
-   `req.body` is now removed instead of being deprecated. New response object now has a `.json()` method that should be the preferred way.

This codemod does not update the mentioned signatures of callback methods due to the fact that there are more changes in other codemods included in the `upgrade-recipe` that rely on the old signature. To apply the changes, you will have to run the recipe or run a `callback-signature` codemod that will do only that and replace all the references of old signature arguments.

## Example

### Before

```ts
import { rest } from 'msw';

rest.get('/user', (req, res, ctx) => {
	const search = req.url.searchParams;
	const { cookies, body: reqBody, thing } = req;

	const { params } = req;

	const userCookies = req.cookies.user;
	const requestParams = req.params.thing;

	return res(ctx.json({ firstName: 'John' }));
});
```

### After

```ts
import { http as caller, type HttpHandler } from 'msw';
import { setupWorker } from 'msw/browser';

const handlers: HttpHandler[] = [
	caller.get('/user', (req, res, ctx) => {
		const url = new URL(request.url);
		const search = url.searchParams;
		const { thing } = req;

		const userCookies = cookies.user;
		const requestParams = params.thing;

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

Up to 15 minutes per occurrence

### Owner

[Intuita](https://github.com/codemod-com)

### Links for more info

-   https://mswjs.io/docs/migrations/1.x-to-2.x/#request-changes
