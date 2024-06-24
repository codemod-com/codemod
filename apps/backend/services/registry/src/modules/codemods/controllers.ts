import { type Prisma, PrismaClient } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "../../config/env";
import type {
  GetCodemodDownloadLinkQuery,
  GetCodemodParams,
  GetCodemodsListParams,
} from "./schemas";

const prisma = new PrismaClient();

export async function getCodemod(
  request: FastifyRequest<{ Params: GetCodemodParams }>,
  reply: FastifyReply,
) {
  const { slug } = request.params;

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
    reply.type("application/json").code(404);
    return { error: "Codemod not found" };
  }

  reply.type("application/json").code(200);
  return { codemod };
}

export async function getCodemodsList(
  request: FastifyRequest<{ Params: GetCodemodsListParams }>,
  reply: FastifyReply,
) {
  const { q } = request.params;
  const { namespaces } = request;

  const and: Prisma.CodemodWhereInput["AND"] = [];
  const where: Prisma.CodemodWhereInput = {
    AND: and,
  };

  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { tags: { hasSome: [q] } },
      ],
    });
  }

  if (namespaces) {
    and.push({
      OR: [{ private: false }, { owner: { in: namespaces } }],
    });
  }

  const codemods = (
    await prisma.codemod.findMany({
      where,
      select: {
        name: true,
        slug: true,
        owner: true,
        tags: true,
        verified: true,
        updatedAt: true,
        versions: {
          select: {
            engine: true,
            arguments: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })
  ).map((codemod) => ({
    ...codemod,
    engine: codemod.versions[0]?.engine,
    arguments: codemod.versions[0]?.arguments,
  }));

  reply.type("application/json").code(200);
  return { codemods };
}

export async function getCodemodDownloadLink(
  request: FastifyRequest<{ Querystring: GetCodemodDownloadLinkQuery }>,
  reply: FastifyReply,
) {
  const { name } = request.query;
  const { namespaces } = request;

  const and: Prisma.CodemodWhereInput["AND"] = [{ AND: { name } }];
  const where: Prisma.CodemodWhereInput = {
    AND: and,
  };

  let link: null | string = null;

  if (namespaces) {
    and.push({
      OR: [{ private: false }, { owner: { in: namespaces } }],
    });
  }

  const codemod = await prisma.codemod.findFirst({
    where,
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
    reply.type("application/json").code(404);
    return { error: "Codemod not found" };
  }

  const latestVersion = codemod.versions?.[0];

  if (!latestVersion) {
    reply.type("application/json").code(404);
    return { error: "Codemod version not found" };
  }
  const { s3Bucket, s3UploadKey, version } = latestVersion;

  link = `https://${s3Bucket}.s3.us-west-1.amazonaws.com/${s3UploadKey}`;

  if (codemod.private && namespaces) {
    const s3Client = new S3Client({
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
      region: "us-west-1",
    });

    link = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: s3Bucket,
        Key: s3UploadKey,
      }),
      { expiresIn: 30 },
    );
  }

  reply.type("application/json").code(200);
  return { link, version };
}
