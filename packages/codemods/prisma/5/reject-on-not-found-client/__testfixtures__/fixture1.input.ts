// @ts-nocheck
const prisma = new PrismaClient({
  rejectOnNotFound: true,
});

prisma.user.findFirst({
  where: { name: 'Alice' },
});

prisma.user.findUnique({
  where: { id: 1 },
});
