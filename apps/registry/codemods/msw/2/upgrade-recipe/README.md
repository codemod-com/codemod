# MSW migration recipe

## Description

This recipe is a set of codemods that will upgrade your project from using msw v1 to v2.

The recipe includes the following codemods:

-   [imports](https://github.com/codemod-com/codemod-registry/tree/main/codemods/msw/2/imports)
-   [type-args](https://github.com/codemod-com/codemod-registry/tree/main/codemods/msw/2/type-args)
-   [request-changes](https://github.com/codemod-com/codemod-registry/tree/main/codemods/msw/2/request-changes)
-   [ctx-fetch](https://github.com/codemod-com/codemod-registry/tree/main/codemods/msw/2/ctx-fetch)
-   [req-passthrough](https://github.com/codemod-com/codemod-registry/tree/main/codemods/msw/2/req-passthrough)
-   [response-usages](https://github.com/codemod-com/codemod-registry/tree/main/codemods/msw/2/response-usages)
-   [callback-signature](https://github.com/codemod-com/codemod-registry/tree/main/codemods/msw/2/callback-signature)
-   [lifecycle-events-signature](https://github.com/codemod-com/codemod-registry/tree/main/codemods/msw/2/lifecycle-events-signature)
-   [print-handler](https://github.com/codemod-com/codemod-registry/tree/main/codemods/msw/2/print-handler)

### FNs

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

## Applicability Criteria

MSW version >= 1.0.0

## Other Metadata

TODO: [config changes](https://mswjs.io/docs/migrations/1.x-to-2.x/#frequent-issues)

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### Estimated Time Saving

Depending on the size of the project, this recipe can save up to 6 hours of dedicated work and more.

### Owner

[Codemod.com](https://github.com/codemod-com)

### Links for more info

-   https://mswjs.io/docs/migrations/1.x-to-2.x/
