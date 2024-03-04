# Move Generic Arguments and Body Type Casts

## Description

There is a change to generic type interface of `rest.method()` calls. This codemod puts the generic arguments in the correct order to keep type safety.

### WARNING

This codemod runs `.fixUnusedIdentifiers()` on a target source file. This would remove any unused declarations in the file. This is due to the atomicity of this codemod, which blindly inserts the callback structure into each msw handler callback and then cleans up the variables that are not used anymore.

## Example

### Before

```ts
http.get<ReqBodyType, PathParamsType>('/resource', (req, res, ctx) => {
	return res(ctx.json({ firstName: 'John' }));
});
```

### After

```ts
http.get<PathParamsType, ReqBodyType>('/resource', (req, res, ctx) => {
	return res(ctx.json({ firstName: 'John' }));
});
```

### Before

```ts
http.get<ReqBodyType>('/resource', (req, res, ctx) => {
	return res(ctx.json({ firstName: 'John' }));
});
```

### After

```ts
http.get<any, ReqBodyType>('/resource', (req, res, ctx) => {
	return res(ctx.json({ firstName: 'John' }));
});
```

### Before

```ts
const handlers: RestHandler<DefaultBodyType>[] = [
	http.get('/resource', (req, res, ctx) => {
		return res(ctx.json({ firstName: 'John' }));
	}),
];
```

### After

```ts
const handlers: HttpHandler[] = [
	http.get<any, DefaultBodyType>('/resource', (req, res, ctx) => {
		return res(ctx.json({ firstName: 'John' }));
	}),
];
```

### Before

```ts
export function mockFactory(
	url: string,
	resolver: ResponseResolver<
		MockedRequest<{ id: string }>,
		RestContext,
		Awaited<ImportedPromiseBodyType>
	>,
) {
	return http.get(url, resolver);
}
```

### After

```ts
export function mockFactory(
	url: string,
	resolver: ResponseResolver<
		HttpRequestResolverExtras<PathParams>,
		{ id: string },
		Awaited<ImportedPromiseBodyType>
	>,
) {
	return http.get(url, resolver);
}
```
