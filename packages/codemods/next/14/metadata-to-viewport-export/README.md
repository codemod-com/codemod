This codemod migrates certain viewport metadata to `viewport` export.

## Example

### Before

```jsx
export const metadata = {
	title: 'My App',
	themeColor: 'dark',
	viewport: {
		width: 1,
	},
};
```

### After

```jsx
export const metadata = {
	title: 'My App',
};

export const viewport = {
	width: 1,
	themeColor: 'dark',
};
```
