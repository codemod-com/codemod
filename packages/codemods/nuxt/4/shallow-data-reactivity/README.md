The `data` object returned from `useAsyncData`, `useFetch`, `useLazyAsyncData` and `useLazyFetch` is now a `shallowRef` rather than a `ref`.

When new data is fetched, anything depending on `data` will still be reactive because the entire object is replaced. But if your code changes a property within that data structure, this will not trigger any reactivity in your app.

This brings a significant performance improvement for deeply nested objects and arrays because Vue does not need to watch every single property/array for modification. In most cases, data should also be immutable.

## Before

```jsx
const { data } = useFetch('/api/test')
```

> This can apply to all useAsyncData, useFetch, useLazyAsyncData and useLazyFetch.

## After

```jsx
const { data } = useFetch('/api/test', { deep: true })
```
