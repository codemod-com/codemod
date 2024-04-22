This codemod renames `addBuildHook` to `addBuildEventHandler` as required in Netlify SDK v0.8.1.

## Before

```jsx
import { NetlifyIntegration } from '@netlify/sdk';

const integration = new NetlifyIntegration();

// Adding a build event handler
integration.addBuildHook('onPreBuild', () => {
	console.log('This is my first build event handler!');
});
```

## After

```jsx
import { NetlifyIntegration } from '@netlify/sdk';

const integration = new NetlifyIntegration();

// Adding a build event handler
integration.addBuildEventHandler('onPreBuild', () => {
	console.log('This is my first build event handler!');
});
```
