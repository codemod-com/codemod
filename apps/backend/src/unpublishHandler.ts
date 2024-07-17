import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
import {
  extractLibNameAndVersion,
  isNeitherNullNorUndefined,
} from "@codemod-com/utilities";
import type { RouteHandler } from "fastify";
import { buildRevalidateHelper } from "./revalidate";
import { parseUnpublishBody } from "./schemata/schema";
import { environment } from "./util";

export type UnPublishHandlerResponse =
  | { success: true }
  | { error: string; success: false };

export const unpublishHandler: RouteHandler<{
  Reply: UnPublishHandlerResponse;
}> = async (request: UserDataPopulatedRequest, reply) => {
  try {
    const { username } = request.user!;
    const orgs = request.organizations!;

    if (username === null) {
      throw new Error("The username of the current user does not exist");
    }

    const { name } = parseUnpublishBody(request.body);
    const { libName: codemodName, version } = extractLibNameAndVersion(name);

    const codemod = await prisma.codemod.findFirst({
      where: { name: codemodName },
      include: {
        versions: {
          select: {
            id: true,
            version: true,
            s3Bucket: true,
            s3UploadKey: true,
          },
        },
      },
    });

    if (codemod === null) {
      return reply.code(400).send({
        error: `Codemod ${codemodName} not found in the Registry`,
        success: false,
      });
    }

    let skipCheck = false;

    const allowedNamespaces = [
      username,
      ...orgs.map((org) => org.organization.slug),
    ].filter(isNeitherNullNorUndefined);

    // Allow Codemod engineers to unpublish anything if required
    if (environment.VERIFIED_PUBLISHERS.includes(username)) {
      skipCheck = true;
    }

    if (!skipCheck && !allowedNamespaces.includes(codemod.author)) {
      return reply.code(403).send({
        error: "You are not allowed to perform this operation",
        success: false,
      });
    }

    let client: S3Client;
    try {
      client = new S3Client({
        credentials: {
          accessKeyId: environment.AWS_ACCESS_KEY_ID ?? "",
          secretAccessKey: environment.AWS_SECRET_ACCESS_KEY ?? "",
        },
        region: "us-west-1",
      });
    } catch (err) {
      console.error("Failed instantiating S3 client:", err);

      return reply.code(500).send();
    }

    const REQUEST_TIMEOUT = 5000;

    if (version === null) {
      await Promise.all(
        codemod.versions.map(async (version) => {
          try {
            await client.send(
              new DeleteObjectCommand({
                Bucket: version.s3Bucket,
                Key: version.s3UploadKey,
              }),
              { requestTimeout: REQUEST_TIMEOUT },
            );
          } catch (err) {
            console.error(
              `Failed deleting object from S3 (${version.s3UploadKey}) :`,
              err,
            );
          }
        }),
      );

      await prisma.codemod.delete({
        where: { name: codemodName },
      });

      const revalidate = buildRevalidateHelper(environment);
      await revalidate(name);

      return reply.code(200).send({ success: true });
    }

    const versionToRemove = codemod.versions.find((v) => v.version === version);

    if (!versionToRemove) {
      return reply.code(400).send({
        error: `Version ${version} not found in the Registry`,
        success: false,
      });
    }

    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: versionToRemove.s3Bucket,
          Key: versionToRemove.s3UploadKey,
        }),
        { requestTimeout: REQUEST_TIMEOUT },
      );
    } catch (err) {
      console.error(
        `Failed deleting object from S3 (${versionToRemove.s3UploadKey}) :`,
        err,
      );
    }

    if (codemod.versions.length === 1) {
      await prisma.codemod.delete({
        where: { name: codemodName },
      });
    } else {
      await prisma.codemodVersion.delete({
        where: { id: versionToRemove.id },
      });
    }

    const revalidate = buildRevalidateHelper(environment);
    await revalidate(name);

    return reply.code(200).send({ success: true });
  } catch (err) {
    console.error(err);
    return reply.code(500).send({
      error: `Failed calling unpublish endpoint: ${(err as Error).message}`,
      success: false,
    });
  }
};
