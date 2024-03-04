# Replace MSW Imports

## Description

Following the original msw [upgrade guide](https://mswjs.io/docs/migrations/1.x-to-2.x/#imports), there are certain imports that changed their location and/or naming. This codemod will adjust your imports to the new location and naming.

-   `setupWorker` is now imported from `msw/browser`
-   `rest` from `msw` is now named `http`
-   `RestHandler` from `msw` is now named `HttpHandler`

## Example

### Before

```ts
import { rest as caller, RestHandler, setupWorker } from 'msw';

const handlers: RestHandler[] = [
	caller.get('/user', (req, res, ctx) => {
		return res(ctx.json({ firstName: 'John' }));
	}),
];
```

### After

```ts
import { http as caller, HttpHandler } from 'msw';
import { setupWorker } from 'msw/browser';

const handlers: HttpHandler[] = [
	caller.get('/user', (req, res, ctx) => {
		return res(ctx.json({ firstName: 'John' }));
	}),
];
```
