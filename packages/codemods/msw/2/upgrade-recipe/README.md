This recipe is a set of codemods that will upgrade your project from using msw v1 to v2.

## FNs

This recipe does not change the signatures of MSW handlers, if they were called using a custom factory function, for example to provide more type-safety or else. For example, the following code will only be partially updated:

```ts
export function mockFactory<T extends MyComplexType>(
	url: string,
	resolver: MyResolverType,
) {
	return rest.get(url, resolver);
}

const handlers = [
	mockFactory('/some/url', (req, res, ctx) => {
		return res(ctx.status(200));
	}),
];
```

Also, if you were using req.body in your interceptors, this codemod will blindly assume you want `await request.json()` instead of any other type. You will have to correct that manually.
