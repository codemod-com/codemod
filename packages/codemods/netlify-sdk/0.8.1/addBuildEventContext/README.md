This codemod renames `addBuildContext` to `addBuildEventContext` as required in Netlify SDK v0.8.1.

## Before

```jsx
import { NetlifyIntegration } from '@netlify/sdk';

const integration = new NetlifyIntegration();

// Adding a build event handler
integration.addBuildContext(() => {});
```

## After

```jsx
import { NetlifyIntegration } from '@netlify/sdk';

const integration = new NetlifyIntegration();

// Adding a build event handler
integration.addBuildEventContext(() => {});
```
