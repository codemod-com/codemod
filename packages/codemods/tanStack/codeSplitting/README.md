



This codemod automates the process of splitting your TanStack Router route files into two separate files to enable code splitting. By utilizing this codemod, you can easily move non-critical route configuration, such as the component, into a separate `.lazy.tsx` file, which allows for better performance and reduced initial load time in your React application.

## Before Code Splitting

In the original setup, all route configurations, including critical and non-critical parts, are contained within a single file.

```tsx
// src/routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router';
import { fetchPosts } from './api';

export const Route = createFileRoute('/posts')({
  loader: fetchPosts,
  component: Posts,
});

function Posts() {
  // ...
}
```

## After Code Splitting

After running the codemod, the route configuration is split into two files:

### Critical Route Configuration

The critical part of the route configuration remains in the original file:

```tsx
// src/routes/posts.tsx

import { createFileRoute } from '@tanstack/react-router';
import { fetchPosts } from './api';

export const Route = createFileRoute('/posts')({
  loader: fetchPosts,
});
```

### Non-Critical Route Configuration

The non-critical part, such as the component, is moved to a new `.lazy.tsx` file:

```tsx
// src/routes/posts.lazy.tsx
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/posts')({
  component: Posts,
});

function Posts() {
  // ...
}
```