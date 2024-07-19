// @ts-nocheck
prisma.post.create({
  data: {
    tags: 'databases',
  },
})

prisma.post.findMany({
  where: {
    tags: 'databases',
  },
})