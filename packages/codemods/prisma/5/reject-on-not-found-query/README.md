Removes `rejectOnNotFound` deprecated param from prisma query. 

## Example

### Before

```ts
prisma.user.findFirst({
  where: { name: 'Alice' },
  rejectOnNotFound: true,
});
```

### After

```ts
prisma.user.findFirstOrThrow({
  where: { name: 'Alice' },
});
```

