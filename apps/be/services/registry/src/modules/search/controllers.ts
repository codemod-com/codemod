import { type Prisma, type Tag, prisma } from "@codemod-com/database";

import type { FastifyReply, FastifyRequest } from "fastify";
import type { SearchQuery } from "./schemas";

export async function filters(
  request: FastifyRequest<{ Querystring: SearchQuery }>,
  reply: FastifyReply,
) {
  const { q, category, author, framework } = request.query;

  const categories: Tag[] = await prisma.tag.findMany({
    where: { classification: "category" },
  });
  const frameworks: Tag[] = await prisma.tag.findMany({
    where: { classification: "framework" },
  });

  const and: Prisma.CodemodWhereInput["AND"] = [];
  const where: Prisma.CodemodWhereInput = {
    AND: and,
  };

  if (q) {
    and.push({
      OR: [
        {
          name: {
            search: q,
          },
          description: {
            search: q,
          },
          tags: {
            has: q,
          },
        },
      ],
    });
  }

  if (category?.length) {
    and.push({
      tags: { hasSome: category },
    });
  }

  if (author?.length) {
    and.push({
      author: { in: author },
    });
  }

  if (framework?.length) {
    and.push({
      frameworks: { hasSome: framework },
    });
  }

  const authorCounts = await prisma.codemod.groupBy({
    by: ["author"],
    _count: {
      author: true,
    },
    where,
  });

  const frameworkCounts = await Promise.all(
    frameworks.map(async (framework) => {
      const count = await prisma.codemod.count({
        where: {
          AND: [
            where,
            {
              frameworks: {
                hasSome: framework.aliases,
              },
            },
          ],
        },
      });
      return { framework: framework.title, count };
    }),
  );

  const categoryCounts = await Promise.all(
    categories.map(async (category) => {
      const count = await prisma.codemod.count({
        where: {
          AND: [
            where,
            {
              category: { in: category.aliases },
            },
          ],
        },
      });

      return { category: category.title, count };
    }),
  );

  const filters = {
    frameworks: frameworkCounts,
    categories: categoryCounts,
  };

  reply.type("application/json").code(200);
  return { frameworkCounts, categoryCounts };
}

export async function search(
  request: FastifyRequest<{ Querystring: SearchQuery }>,
  reply: FastifyReply,
) {
  const { q, category, author, framework } = request.query;

  console.log(q);

  const page = request.query.page ?? 1;
  const size = request.query.size ?? 20;

  const and: Prisma.CodemodWhereInput["AND"] = [];
  const where: Prisma.CodemodWhereInput = {
    AND: and,
  };
  const orderBy: Prisma.CodemodOrderByWithRelationAndSearchRelevanceInput[] =
    [];

  // if (q) {
  //   orderBy.push()
  // } elae

  if (category?.length) {
    and.push({
      tags: { hasSome: category },
    });
  }

  if (author?.length) {
    and.push({
      author: { in: author },
    });
  }

  if (framework?.length) {
    and.push({
      frameworks: { hasSome: framework },
    });
  }

  const [codemods, total] = await Promise.all([
    prisma.codemod.findMany({
      where,
      orderBy,
      skip: (page - 1) * size,
      take: size,
      include: {
        versions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      relationLoadStrategy: "join",
    }),
    prisma.codemod.count({ where }),
  ]);

  const result = await prisma.codemod.findMany({
    where: {
      description: {
        search: "react | next",
      },
    },
  });

  reply.type("application/json").code(200);
  return { total, page, size, result };
}
