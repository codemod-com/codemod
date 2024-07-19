// @ts-nocheck
prisma.post.findMany({
  where: {
    commentsList: {
      equals: [{ text: 'hello' }],
    },
  },
})

prisma.post.create({
  data: {
    commentsList: [{ text: 'hello' }],
  },
})

prisma.post.findMany({
  where: {
    commentsList: [{ text: 'hello' }],
  },
})