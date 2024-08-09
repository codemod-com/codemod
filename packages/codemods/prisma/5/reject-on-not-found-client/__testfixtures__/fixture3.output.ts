// @ts-nocheck
const prisma = new PrismaClient();

prisma.user.findFirstOrThrow({
  where: { name: 'Alice' },
});

prisma.user.findUnique({
  where: { id: 1 },
});
