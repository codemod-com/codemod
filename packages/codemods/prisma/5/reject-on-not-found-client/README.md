Removes `rejectOnNotFound` deprecated param from prisma client.

## Example

### Before

```ts
const prisma = new PrismaClient({
  rejectOnNotFound: true,
});

prisma.user.findFirst({
  where: { name: 'Alice' },
});

prisma.user.findUnique({
  where: { id: 1 },
});
```

### After

```ts
const prisma = new PrismaClient();

prisma.user.findFirstOrThrow({
  where: { name: 'Alice' },
});

prisma.user.findUniqueOrThrow({
  where: { id: 1 },
});
```

