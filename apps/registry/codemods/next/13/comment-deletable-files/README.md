# Comment Deletable Files

## Description

This codemod is recommended when migrating from the `/pages` to the `/app` directory.

It adds a comment to files that should be deleted and migrated to different files during the migration process.

Namely, such are the following files:

-   `_document.*`,
-   `_app.*`,
-   `_error.*`.

## Example

### Before

```jsx
import 'highlight.js/styles/default.css';
import 'swagger-ui-react/swagger-ui.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
	return <Component {...pageProps} />;
}

export default MyApp;
```

### After

```jsx
/*This file should be deleted. Please migrate its contents to appropriate files*/
import 'highlight.js/styles/default.css';
import 'swagger-ui-react/swagger-ui.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
	return <Component {...pageProps} />;
}

export default MyApp;
```

## Applicability Criteria

Next.js version higher or equal to 13.4

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

The purpose of this codemod is to guide the user into the files that should be migrated away, which should equal ~5 minutes total of estimated time saving.

### Owner

[Codemod.com](https://github.com/codemod-com)
