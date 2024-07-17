// @ts-nocheck
prisma.user.findMany({
  where: {
    id: { in: 123 },
  },
})

prisma.user.findMany({
  where: {
    id: { notIn: 123 },
  },
})