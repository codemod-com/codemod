// @ts-nocheck
prisma.user.findFirst({
  where: { name: 'Alice' },
  rejectOnNotFound: true,
});

prisma.user.findUnique({
  where: { name: 'Alice' },
  rejectOnNotFound: true,
});
