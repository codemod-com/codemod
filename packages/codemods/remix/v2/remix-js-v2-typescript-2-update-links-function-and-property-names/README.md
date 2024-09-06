Route links properties should all be the React camelCase values instead of HTML lowercase values. 

### Before

```ts
export const links: LinksFunction = () => {
  return [{
    rel: 'preload',
    as: 'image',
    imagesrcset: '...',
    imagesizes: '...',
  }, ];
};
```

### After

```ts
export const links: V2_LinksFunction = () => {
  return [{
    rel: 'preload',
    as: 'image',
    imageSrcSet: '...',
    imageSizes: '...',
  }, ];
};
```

