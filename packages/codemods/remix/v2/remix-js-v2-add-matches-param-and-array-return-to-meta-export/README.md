Instead of returning an object from meta, you will now return an array of descriptors and manage the merge yourself. This brings the meta API closer to links, and it allows for more flexibility and control over how meta tags are rendered.

### Before

```ts
export const meta: MetaFunction = ({ data }) => {
  const title = 'My Page Title';

  return {
    charset: 'utf-8',
    viewport: 'width=device-width,initial-scale=1',
    title,
  };
};
```

### After

```ts
export const meta: MetaFunction = ({ data, matches }) => {
  const title = 'My Page Title';

  return [{
    charset: 'utf-8',
    viewport: 'width=device-width,initial-scale=1',
    title,
  }, ];
};
```

