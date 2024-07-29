The `useSession` hook has been updated to return an object. This allows you to test states much more cleanly with the new status option.

### Before

```ts
const [session, loading] = useSession();
```

### After

```ts
const { data: session, status } = useSession();
const loading = status === 'loading';
```

