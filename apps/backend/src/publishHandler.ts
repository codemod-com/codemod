import { createHash, randomBytes } from "node:crypto";
import * as fs from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import axios from "axios";
import type { RouteHandler } from "fastify";
import * as semver from "semver";

import {
  type ApiResponse,
  CODEMOD_CONFIG_INVALID,
  CODEMOD_NAME_TAKEN,
  CODEMOD_VERSION_EXISTS,
  INTERNAL_SERVER_ERROR,
  NO_CODEMOD_TO_PUBLISH,
  NO_CONFIG_FILE_FOUND,
  NO_MAIN_FILE_FOUND,
  type PublishResponse,
  UNAUTHORIZED,
} from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
// Direct import because tree-shaking helps this to not throw.
import { getCodemodExecutable } from "@codemod-com/runner/dist/source-code.js";
import {
  buildCodemodSlug,
  codemodNameRegex,
  getCodemodRc,
  getEntryPath,
  isNeitherNullNorUndefined,
  tar,
  untar,
  unzip,
} from "@codemod-com/utilities";

import { buildRevalidateHelper } from "./revalidate.js";
import { environment } from "./util.js";

export type PublishHandlerResponse = ApiResponse<PublishResponse>;

export const publishHandler: RouteHandler<{
  Reply: PublishHandlerResponse;
}> = async (request: UserDataPopulatedRequest, reply) => {
  const unpackPath = join(
    homedir(),
    ".codemod",
    "temp",
    randomBytes(8).toString("hex"),
  );
  await fs.promises.mkdir(unpackPath, { recursive: true });

  try {
    const allowedNamespaces = request.allowedNamespaces!;

    const {
      username,
      primaryEmailAddressId,
      emailAddresses,
      firstName,
      lastName,
    } = request.user!;

    if (username === null) {
      return reply.status(400).send({
        errorText: "The username of the current user does not exist",
        error: UNAUTHORIZED,
      });
    }

    let codemodTarArchiveBuffer: Buffer | null = null;
    let codemodZipArchiveBuffer: Buffer | null = null;

    for await (const multipartFile of request.files({
      limits: { fileSize: 1024 * 1024 * 100 },
    })) {
      const buffer = await multipartFile.toBuffer();

      if (multipartFile.fieldname === "codemod.tar.gz") {
        codemodTarArchiveBuffer = buffer;
      }

      if (multipartFile.fieldname === "codemod.zip") {
        codemodZipArchiveBuffer = buffer;
      }
    }

    let codemodArchiveBuffer: Buffer;
    if (codemodTarArchiveBuffer !== null) {
      codemodArchiveBuffer = codemodTarArchiveBuffer;
      const tarPath = join(unpackPath, "codemod.tar.gz");
      await fs.promises.writeFile(tarPath, codemodTarArchiveBuffer);

      await untar(tarPath, unpackPath);
    } else if (codemodZipArchiveBuffer !== null) {
      const zipPath = join(unpackPath, "codemod.zip");
      await fs.promises.writeFile(zipPath, codemodZipArchiveBuffer);

      await unzip(zipPath, unpackPath);

      // For further uploading to S3
      await fs.promises.rm(zipPath);

      const tarPath = join(unpackPath, "codemod.tar.gz");
      await tar(unpackPath, tarPath);
      codemodArchiveBuffer = await fs.promises.readFile(tarPath);
    } else {
      return reply.code(400).send({
        error: NO_CODEMOD_TO_PUBLISH,
        errorText: "No codemod archive was provided",
      });
    }

    const { config: codemodRc } = await getCodemodRc({
      source: unpackPath,
      throwOnNotFound: false,
    });

    if (codemodRc === null) {
      return reply.code(400).send({
        error: NO_CONFIG_FILE_FOUND,
        errorText: "No .codemodrc.json file was provided",
      });
    }

    if (codemodRc.engine === "recipe") {
      if (codemodRc.names.length < 2) {
        return reply.status(400).send({
          errorText: `The "names" field in .codemodrc.json must contain at least two names for a recipe codemod.`,
          error: CODEMOD_CONFIG_INVALID,
        });
      }

      for (const name of codemodRc.names) {
        if (!codemodNameRegex.test(name)) {
          return reply.status(400).send({
            errorText: `Each entry in the "names" field in .codemodrc.json must only contain allowed characters (a-z, A-Z, 0-9, _, /, @ or -)`,
            error: CODEMOD_CONFIG_INVALID,
          });
        }
      }
    }

    if (codemodRc.engine !== "recipe") {
      const { path } = await getEntryPath({
        source: unpackPath,
        throwOnNotFound: false,
      });

      const built = await getCodemodExecutable(
        unpackPath,
        false,
        codemodRc.engine,
      ).catch(() => null);

      if (path === null || built === null) {
        return reply.code(400).send({
          error: NO_MAIN_FILE_FOUND,
          errorText: "No main file was provided",
        });
      }

      if (!codemodNameRegex.test(codemodRc.name)) {
        return reply.status(400).send({
          errorText: `The "name" field in .codemodrc.json must only contain allowed characters (a-z, A-Z, 0-9, _, /, @ or -)`,
          error: CODEMOD_CONFIG_INVALID,
        });
      }
    }

    let { name, version } = codemodRc;

    const isPublishedFromStudio =
      request.headers.origin?.startsWith(environment.FRONTEND_URL) ?? false;
    name = isPublishedFromStudio
      ? `${name}-${randomBytes(4).toString("hex")}`
      : name;

    let namespace: string | null = null;
    try {
      const formData = await request.formData();
      namespace = formData.get("namespace")?.toString() ?? null;
    } catch (err) {
      //
    }

    let isPrivate = false;

    if (!namespace) {
      if (name.startsWith("@") && name.includes("/")) {
        namespace = name.split("/").at(0)?.slice(1)!;
        isPrivate = true;

        if (!allowedNamespaces.includes(namespace)) {
          return reply.code(403).send({
            error: UNAUTHORIZED,
            errorText: `You are not allowed to publish under namespace "${namespace}"`,
          });
        }
      } else {
        namespace = username;
      }
    }

    // private flag in codemodrc as primary source of truth,
    // fallback is to check if publishing under a namespace. if yes - set to private by default
    isPrivate = codemodRc.private ?? isPrivate;

    // @TODO: remove this logic in favor of having the organization in Clerk
    // Unless we roll our own auth, it requires to upgrade to Clerk B2B plan at $100/month
    const isVerified =
      namespace === "codemod-com" ||
      environment.VERIFIED_PUBLISHERS.includes(username);
    const author = isVerified ? "Codemod" : namespace;

    if (!isNeitherNullNorUndefined(name)) {
      return reply.code(400).send({
        error: CODEMOD_CONFIG_INVALID,
        errorText: "Codemod name was not provided in codemodrc",
      });
    }

    if (!isNeitherNullNorUndefined(version)) {
      return reply.code(400).send({
        error: CODEMOD_CONFIG_INVALID,
        errorText: "Codemod version was not provided in codemodrc",
      });
    }

    const latestVersion = await prisma.codemodVersion.findFirst({
      where: {
        codemod: {
          name,
        },
      },
      orderBy: {
        version: "desc",
      },
      take: 1,
    });

    if (latestVersion !== null && !semver.gt(version, latestVersion.version)) {
      return reply.code(400).send({
        error: CODEMOD_VERSION_EXISTS,
        errorText: `Codemod ${name} version ${version} is lower than the latest published or the same as the latest published version: ${latestVersion.version}`,
      });
    }

    const hashDigest = createHash("ripemd160").update(name).digest("base64url");
    const REQUEST_TIMEOUT = 5000;
    const bucket =
      isPrivate && namespace
        ? environment.AWS_PRIVATE_BUCKET_NAME
        : environment.AWS_PUBLIC_BUCKET_NAME;

    const uploadKeyParts = [hashDigest, version, "codemod.tar.gz"];
    if (isPrivate && namespace) {
      uploadKeyParts.unshift(namespace);
    }
    uploadKeyParts.unshift("codemod-registry");
    const uploadKey = uploadKeyParts.join("/");

    let readmeContents: string | null = null;
    try {
      readmeContents = await fs.promises.readFile(
        join(unpackPath, "README.md"),
        { encoding: "utf-8" },
      );
    } catch (err) {
      //
    }

    const codemodVersionEntry = {
      version,
      s3Bucket: bucket,
      s3UploadKey: uploadKey,
      engine: codemodRc.engine,
      sourceRepo: codemodRc.meta?.git,
      shortDescription: readmeContents,
      vsCodeLink: `vscode://codemod.codemod-vscode-extension/showCodemod?chd=${hashDigest}`,
      applicability: codemodRc.applicability,
      tags: codemodRc.meta?.tags,
      arguments: codemodRc.arguments,
    };

    // Check if a codemod with the name already exists from other author
    const existingCodemod = await prisma.codemod.findUnique({
      where: {
        name,
        author: {
          not: author,
        },
      },
    });

    if (existingCodemod !== null) {
      return reply.code(400).send({
        error: CODEMOD_NAME_TAKEN,
        errorText: `Codemod name \`${name}\` is already taken.`,
      });
    }

    let createdAtTimestamp: number;
    try {
      const result = await prisma.codemod.upsert({
        where: {
          name,
        },
        create: {
          slug: buildCodemodSlug(name),
          name,
          shortDescription: readmeContents,
          tags: codemodRc.meta?.tags,
          engine: codemodRc.engine,
          applicability: codemodRc.applicability,
          verified: isVerified,
          hidden: isPublishedFromStudio,
          private: isPrivate,
          author,
          arguments: codemodRc.arguments,
          versions: {
            create: codemodVersionEntry,
          },
        },
        update: {
          shortDescription: readmeContents,
          tags: codemodRc.meta?.tags,
          engine: codemodRc.engine,
          applicability: codemodRc.applicability,
          private: isPrivate,
          arguments: codemodRc.arguments,
          versions: {
            create: codemodVersionEntry,
          },
        },
      });

      createdAtTimestamp = result.createdAt.getTime();
    } catch (err) {
      console.error("Failed writing codemod to the database:", err);
      return reply.code(500).send({
        error: INTERNAL_SERVER_ERROR,
        errorText: `Failed writing codemod to the database: ${
          (err as Error).message
        }`,
      });
    }

    try {
      const client = new S3Client({
        credentials: {
          accessKeyId: environment.AWS_ACCESS_KEY_ID ?? "",
          secretAccessKey: environment.AWS_SECRET_ACCESS_KEY ?? "",
        },
        region: "us-west-1",
      });

      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: uploadKey,
          Body: codemodArchiveBuffer,
        }),
        {
          requestTimeout: REQUEST_TIMEOUT,
        },
      );
    } catch (err) {
      console.error("Failed uploading codemod to S3:", err);
      await prisma.codemodVersion.deleteMany({
        where: {
          codemod: {
            name,
          },
          version,
        },
      });

      const otherVersions = await prisma.codemodVersion.findMany({
        where: {
          codemod: {
            name,
          },
        },
      });

      if (otherVersions.length === 0) {
        await prisma.codemod.delete({
          where: {
            name,
          },
        });
      }

      return reply.code(500).send({
        error: INTERNAL_SERVER_ERROR,
        errorText: `Failed publishing to S3: ${(err as Error).message}`,
      });
    }

    if (environment.NODE_ENV === "development") {
      return reply.code(200).send({ name, version: codemodRc.version });
    }

    if (latestVersion === null && !isVerified) {
      try {
        await axios.post(environment.ZAPIER_PUBLISH_HOOK, {
          codemod: {
            name: isPublishedFromStudio ? `${name} (studio publish)` : name,
            from: codemodRc.applicability?.from?.map((tuple) =>
              tuple.join(" "),
            ),
            to: codemodRc.applicability?.to?.map((tuple) => tuple.join(" ")),
            engine: codemodRc.engine,
            publishedAt: createdAtTimestamp,
          },
          author: {
            username,
            name: `${firstName ?? ""} ${lastName ?? ""}`.trim() || null,
            email:
              emailAddresses.find((e) => e.id === primaryEmailAddressId)
                ?.emailAddress ?? null,
          },
        });
      } catch (err) {
        console.error("Failed calling Zapier hook:", err);
      }
    }

    const revalidate = buildRevalidateHelper(environment);
    await revalidate(name);

    return reply.code(200).send({ name, version });
  } catch (err) {
    console.error(err);
    return reply.code(500).send({
      error: INTERNAL_SERVER_ERROR,
      errorText: `Failed calling publish endpoint: ${(err as Error).message}`,
    });
  } finally {
    await fs.promises.rm(unpackPath, {
      recursive: true,
      force: true,
    });
  }
};
