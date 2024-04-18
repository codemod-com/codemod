This codemod renames `addHandler` to `addApiHandler` as required in Netlify SDK v0.8.1.

## Before

```jsx
import { NetlifyIntegration } from '@netlify/sdk';

const integration = new NetlifyIntegration();

integration.addHandler('some-function', async (event, context) => {});
```

## After

```jsx
import { NetlifyIntegration } from '@netlify/sdk';

const integration = new NetlifyIntegration();

integration.addApiHandler('some-function', async (event, context) => {});
```
