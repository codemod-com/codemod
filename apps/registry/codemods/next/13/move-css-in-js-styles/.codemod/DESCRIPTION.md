# Move CSS in JS Styles

## Description

This highly experimental codemod moves the CSS-in-JS styles into the CSS Modules.

## Example

### Before

```jsx
const Head = () => {
	return (
		<head>
			<style type="text/css">
				{`
        body {
          margin: 0;
          padding: 0;
        }
      `}
			</style>
		</head>
	);
};

export default Head;
```

### After

The file gets transformed into:

```jsx
import styles from 'Head.module.css';

const Head = () => {
	return <head className={styles['wrapper']}></head>;
};

export default Head;
```

And the codemod creates the new file `Head.module.css` which contains:

```jsx
body {
	margin: 0;
	padding: 0;
}
```

## Applicability Criteria

Next.js version higher or equal to 13.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~5 minutes per occurrence.

### Owner

[Codemod.com](https://github.com/codemod-com)

### Links for more info

-   https://nextjs.org/docs/pages/building-your-application/styling/css-in-js
