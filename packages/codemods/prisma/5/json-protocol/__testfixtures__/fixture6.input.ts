// @ts-nocheck

// These are known FNs
prisma.user.findMany({
  where: {
    id: { in: listUsedAsAVariable },
  },
})

prisma.user.findMany({
  where: {
    settings: {
      path: listUsedAsAVariable,
      equals: someValue,
    },
  },
})

prisma.post.findMany({
  where: {
    tags: listUsedAsAVariable
  },
})

prisma.post.create({
  data: {
    commentsList: listUsedAsAVariable,
  },
})

prisma.user.findMany({
  where: {
    OR: objectNotWrappedInAnArrayUsedAsAVariable,
  },
})