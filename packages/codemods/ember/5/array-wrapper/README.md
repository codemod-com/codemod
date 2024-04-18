This codemod removes any usage of `new` with `A`, and calls `A` as a standard function.

## Before

```jsx
import { A } from '@ember/array';

let arr = new A();
```

## After

```tsx
import { A as emberA } from '@ember/array';

let arr = A();
```