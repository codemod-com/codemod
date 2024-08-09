// @ts-nocheck
prisma.user.findFirstOrThrow({
  where: { name: 'Alice' }
});

prisma.user.findUniqueOrThrow({
  where: { name: 'Alice' }
});
