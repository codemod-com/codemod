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
