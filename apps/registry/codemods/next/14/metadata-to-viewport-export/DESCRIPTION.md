# Metadata to Viewport Export

## Description

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

## Applicability Criteria

Next.js version higher or equal to 14.

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

-   [Use `viewport` export](https://nextjs.org/docs/pages/building-your-application/upgrading/codemods#use-viewport-export)
