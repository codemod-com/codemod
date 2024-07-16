// @ts-nocheck
prisma.user.findMany({
  where: {
    settings: {
      path: 'someSetting',
      equals: someValue,
      other: '123'
    },
  },
})