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