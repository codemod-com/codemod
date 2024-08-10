// @ts-nocheck
const prisma = new PrismaClient();

prisma.user.findFirst({
  where: { name: 'Alice' },
});

prisma.user.findUniqueOrThrow({
  where: { id: 1 },
});
