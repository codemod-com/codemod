// @ts-nocheck
prisma.user.findMany({
  where: {
    OR: [{ email: 'foo@example.com' }],
  },
})