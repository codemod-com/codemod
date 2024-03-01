# New Link

## Description

Safely removes `<a>` from `Link` components imported from the `next/link` module or adds the `legacyBehavior` prop on the component level.

## Example

### Before

```jsx
export default function Component() {
	return (
		<Link href="/a">
			<a>Anchor</a>
		</Link>
	);
}
```

### After

```jsx
export default function Component() {
	return <Link href="/a">Anchor</Link>;
}
```

## Applicability Criteria

Next.js version higher or equal to 13.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~5 minutes per occurrence

### Owner

[Vercel](https://github.com/vercel)

### Links for more info

-   https://nextjs.org/docs/pages/building-your-application/upgrading/codemods#new-link
