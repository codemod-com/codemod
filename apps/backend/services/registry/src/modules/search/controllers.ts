import { type Prisma, PrismaClient } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { SearchQuery } from "./schemas";

const prisma = new PrismaClient();

export async function filters(
  request: FastifyRequest<{ Querystring: SearchQuery }>,
  reply: FastifyReply,
) {
  const { q, category, owner, framework } = request.query;

  const and: Prisma.CodemodWhereInput["AND"] = [];
  const where: Prisma.CodemodWhereInput = {
    AND: and,
  };

  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { owner: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { hasSome: [q] } },
      ],
    });
  }

  if (category?.length) {
    and.push({ category: { in: category } });
  }

  if (owner?.length) {
    and.push({ owner: { in: owner } });
  }

  if (framework?.length) {
    and.push({ frameworks: { hasSome: framework } });
  }

  const categories = (
    await prisma.codemod.groupBy({
      by: ["category"],
      where: where,
      _count: { category: true },
    })
  ).map(({ category, _count }) => ({
    title: category,
    count: _count.category,
  }));

  const owners = (
    await prisma.codemod.groupBy({
      by: ["owner"],
      where: where,
      _count: { owner: true },
    })
  ).map(({ owner, _count }) => ({
    title: owner,
    count: _count.owner,
  }));

  const frameworks = Object.entries(
    (
      await prisma.codemod.groupBy({
        by: ["frameworks"],
        where: where,
        _count: { frameworks: true },
      })
    ).reduce(
      (accumulator, { frameworks, _count }) => {
        frameworks.forEach((framework) => {
          accumulator[framework] =
            (accumulator[framework] || 0) + _count.frameworks;
        });
        return accumulator;
      },
      {} as Record<string, number>,
    ),
  ).map(([framework, count]) => ({
    title: framework,
    count,
  }));

  reply.type("application/json").code(200);
  return { filters: { categories, owners, frameworks } };
}

export async function search(
  request: FastifyRequest<{ Querystring: SearchQuery }>,
  reply: FastifyReply,
) {
  const { q, category, owner, framework, page = 1, size = 25 } = request.query;

  const and: Prisma.CodemodWhereInput["AND"] = [];
  const where: Prisma.CodemodWhereInput = {
    AND: and,
  };

  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { owner: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { hasSome: [q] } },
      ],
    });
  }

  if (category?.length) {
    and.push({ category: { in: category } });
  }

  if (owner?.length) {
    and.push({ owner: { in: owner } });
  }

  if (framework?.length) {
    and.push({ frameworks: { hasSome: framework } });
  }

  const [codemods, total] = await Promise.all([
    prisma.codemod.findMany({
      where: where,
      orderBy: [{ featured: "desc" }],
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
    }),
    prisma.codemod.count({ where: where }),
  ]);

  reply.type("application/json").code(200);
  return { total, page, size, codemods };
}
