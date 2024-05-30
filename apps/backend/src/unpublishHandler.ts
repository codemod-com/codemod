import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  extractLibNameAndVersion,
  isNeitherNullNorUndefined,
} from "@codemod-com/utilities";
import type { CustomHandler } from "./customHandler";
import { prisma } from "./db/prisma.js";
import { parseUnpublishBody } from "./schemata/schema";
import { CLAIM_PUBLISHING } from "./services/tokenService.js";

export const unpublishHandler: CustomHandler<Record<string, never>> = async ({
  environment,
  tokenService,
  clerkClient,
  request,
  reply,
}) => {
  try {
    if (clerkClient === null) {
      throw new Error("This endpoint requires auth configuration.");
    }

    const accessToken = getCustomAccessToken(environment, request.headers);

    if (accessToken === null) {
      return reply
        .code(401)
        .send({ error: "Access token is not present", success: false });
    }

    const userId = await tokenService.findUserIdMetadataFromToken(
      accessToken,
      BigInt(Date.now()),
      CLAIM_PUBLISHING,
    );

    if (userId === null) {
      return reply
        .code(401)
        .send({ error: "User id was not found", success: false });
    }

    const { username } = await clerkClient.users.getUser(userId);
    const orgs = await clerkClient.users.getOrganizationMembershipList({
      userId,
    });

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

    const allowedNamespaces = [
      username,
      ...orgs.map((org) => org.organization.slug),
    ].filter(isNeitherNullNorUndefined);

    if (environment.VERIFIED_PUBLISHERS.includes(username)) {
      allowedNamespaces.push("codemod-com", "Codemod");
    }

    if (!allowedNamespaces.includes(codemod.author)) {
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

    return reply.code(200).send({ success: true });
  } catch (err) {
    console.error(err);
    return reply.code(500).send({
      error: `Failed calling unpublish endpoint: ${(err as Error).message}`,
      success: false,
    });
  }
};
