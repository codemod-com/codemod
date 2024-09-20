This codemod updates CSS handling in your project:

- Transforms Tailwind `@apply` directives and CSS selectors by adding `:global()` inside `:is(...)` and `:where(...)` selectors.
- Applies changes to CSS within `<style>` tags in Svelte files.
- Ensures global scope is properly applied to Tailwind utilities and complex selectors.


## Before

```jsx
main {
	@apply bg-blue-100 dark:bg-blue-900;
}
```

## After

```jsx
main :global {
	@apply bg-blue-100 dark:bg-blue-900
}
```
