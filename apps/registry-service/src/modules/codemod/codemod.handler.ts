import { type Prisma, prisma } from "@codemod-com/database";

import type { FastifyReply, FastifyRequest } from "fastify";

import {
  type GetCodemodBySlugData,
  type GetCodemodDownloadLinkData,
  type SearchCodemodsData,
  parseGetCodemodBySlugData,
  parseGetCodemodDownloadLinkData,
  parseSearchCodemodsData,
} from "./codemod.schema";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getAuth } from "@clerk/fastify";
import { generateDynamicFilters } from "./codemod.utils";

export const searchCodemodsHandler = async (
  request: FastifyRequest<{ Querystring: SearchCodemodsData }>,
  reply: FastifyReply,
) => {
  const query = { ...request.query };

  const { search, category, author, framework } =
    parseSearchCodemodsData(query);

  console.log(search, category, author, framework);

  const page = query.page || 1;
  const size = query.size || 30;

  const and: Prisma.CodemodWhereInput["AND"] = [];
  const where: Prisma.CodemodWhereInput = {
    AND: and,
  };
  const orderBy: Prisma.CodemodOrderByWithRelationAndSearchRelevanceInput[] = [
    { featured: "desc" },
    { createdAt: "desc" },
  ];

  if (search) {
    and.push({
      OR: [
        {
          name: {
            search: search,
          },
        },
        {
          versions: {
            some: {
              OR: [
                {
                  description: {
                    search: search,
                  },
                },
                {
                  tags: {
                    hasSome: [search],
                  },
                },
              ],
            },
          },
        },
      ],
    });

    orderBy.push({
      _relevance: {
        fields: ["name", "description"],
        search,
        sort: "desc",
      },
    });
  }

  if (category?.length) {
    and.push({
      versions: {
        some: { tags: { hasSome: category } },
      },
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

  const authorCounts = await prisma.codemod.groupBy({
    by: ["author"],
    _count: {
      author: true,
    },
    where,
  });

  const [frameworks, useCaseCategories] = await Promise.all([
    prisma.tag.findMany({
      where: { classification: "framework" },
    }),
    prisma.tag.findMany({
      where: { classification: "useCaseCategory" },
    }),
  ]);

  const frameworkCounts = await Promise.all(
    frameworks.map(async ({ title, displayName, aliases }) => {
      const count = await prisma.codemod.count({
        where: {
          AND: [
            where,
            {
              frameworks: {
                hasSome: aliases,
              },
            },
          ],
        },
      });

      return { id: title, title: displayName, count };
    }),
  );

  const useCaseCategoryCounts = await Promise.all(
    useCaseCategories.map(async ({ title, displayName, aliases }) => {
      const count = await prisma.codemod.count({
        where: {
          AND: [
            where,
            {
              useCaseCategory: { in: aliases },
            },
          ],
        },
      });

      return { id: title, title: displayName, count };
    }),
  );

  const filters = generateDynamicFilters(
    authorCounts,
    frameworkCounts,
    useCaseCategoryCounts,
  );

  reply.type("application/json").code(200);
  return { total, codemods, filters, page, size };
};

export const getCodemodBySlugHandler = async (
  request: FastifyRequest<{ Params: GetCodemodBySlugData }>,
  reply: FastifyReply,
) => {
  const params = { ...request.params };
  console.log(request);
  const { userId } = getAuth(request);
  console.log(userId);

  const { slug } = parseGetCodemodBySlugData(params);

  const codemod = await prisma.codemod.findFirst({
    where: {
      slug,
    },
    include: {
      versions: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!codemod) {
    reply.code(401).send({ error: "Codemod was not found" });
  }

  reply.type("application/json").code(200);
  return { codemod };
};

export const getCodemodDownloadLinkHandler = async (
  request: FastifyRequest<{ Querystring: GetCodemodDownloadLinkData }>,
  reply: FastifyReply,
) => {
  const query = { ...request.query };

  const { name } = parseGetCodemodDownloadLinkData(query);

  const codemod = await prisma.codemod.findFirst({
    where: {
      name,
      OR: [{ private: false }, { author: {} }],
    },
    include: {
      versions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });
  if (!codemod) {
    throw new Error();
  }

  const latestVersion = codemod.versions.at(0);
  if (!latestVersion) {
    throw new Error();
  }

  let downloadLink: string;

  const { userId } = getAuth(request);
  if (!userId) {
    downloadLink = `https://${latestVersion.s3Bucket}.s3.us-west-1.amazonaws.com/${latestVersion.s3UploadKey}`;

    reply.type("application/json").code(200);
    return { link: downloadLink, version: latestVersion.version };
  }

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
    region: "us-west-1",
  });

  downloadLink = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: latestVersion.s3Bucket,
      Key: latestVersion.s3UploadKey,
    }),
    { expiresIn: 30 },
  );

  reply.type("application/json").code(200);
  return { link: downloadLink, version: latestVersion.version };
};
