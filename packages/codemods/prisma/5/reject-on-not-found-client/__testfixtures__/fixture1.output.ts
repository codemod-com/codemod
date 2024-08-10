// @ts-nocheck
const prisma = new PrismaClient();

prisma.user.findFirstOrThrow({
  where: { name: 'Alice' },
});

prisma.user.findUniqueOrThrow({
  where: { id: 1 },
});
