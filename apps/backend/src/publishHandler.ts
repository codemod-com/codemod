import { createHash } from "node:crypto";
import * as fs from "node:fs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { prisma } from "@codemod-com/database";
import {
  type CodemodConfig,
  TarService,
  buildCodemodSlug,
  codemodNameRegex,
  isNeitherNullNorUndefined,
  parseCodemodConfig,
} from "@codemod-com/utilities";
import axios from "axios";
import type { RouteHandler } from "fastify";
import * as semver from "semver";
import type { UserDataPopulatedRequest } from "./plugins/authPlugin";
import { buildRevalidateHelper } from "./revalidate";
import { environment } from "./util";

export type PublishHandlerResponse =
  | { success: true }
  | { error: string; success: false };

export const publishHandler: RouteHandler<{
  Reply: PublishHandlerResponse;
}> = async (request: UserDataPopulatedRequest, reply) => {
  try {
    const organizations = request.organizations!;

    const {
      username,
      primaryEmailAddressId,
      emailAddresses,
      firstName,
      lastName,
    } = request.user!;

    if (username === null) {
      throw new Error("The username of the current user does not exist");
    }

    let codemodRcBuffer: Buffer | null = null;
    let codemodRc: CodemodConfig | null = null;
    let mainFileBuffer: Buffer | null = null;
    let mainFileName: string | null = null;
    let descriptionMdBuffer: Buffer | null = null;

    for await (const multipartFile of request.files({
      limits: { fileSize: 1024 * 1024 * 100 },
    })) {
      const buffer = await multipartFile.toBuffer();

      if (multipartFile.fieldname === ".codemodrc.json") {
        codemodRcBuffer = buffer;

        const codemodRcData = JSON.parse(codemodRcBuffer.toString("utf8"));

        codemodRc = parseCodemodConfig(codemodRcData);

        if (codemodRc.engine === "recipe") {
          if (codemodRc.names.length < 2) {
            throw new Error(
              `The "names" field in .codemodrc.json must contain at least two names for a recipe codemod.`,
            );
          }

          for (const name of codemodRc.names) {
            if (!codemodNameRegex.test(name)) {
              throw new Error(
                `Each entry in the "names" field in .codemodrc.json must only contain allowed characters (a-z, A-Z, 0-9, _, /, @ or -)`,
              );
            }
          }
        } else if (!codemodNameRegex.test(codemodRc.name)) {
          throw new Error(
            `The "name" field in .codemodrc.json must only contain allowed characters (a-z, A-Z, 0-9, _, /, @ or -)`,
          );
        }
      }

      if (
        ["index.cjs", "rules.toml", "rule.yaml"].includes(
          multipartFile.fieldname,
        )
      ) {
        mainFileName = multipartFile.fieldname;
        mainFileBuffer = buffer;
      }

      if (multipartFile.fieldname === "description.md") {
        descriptionMdBuffer = buffer;
      }
    }

    if (!isNeitherNullNorUndefined(codemodRcBuffer) || !codemodRc) {
      return reply.code(400).send({
        error: "No .codemodrc.json file was provided",
        success: false,
      });
    }

    if (
      codemodRc.engine !== "recipe" &&
      (!isNeitherNullNorUndefined(mainFileBuffer) ||
        !isNeitherNullNorUndefined(mainFileName))
    ) {
      return reply.code(400).send({
        error: "No main file was provided",
        success: false,
      });
    }

    const { name, version } = codemodRc;

    let namespace: string | null = null;
    if (name.startsWith("@") && name.includes("/")) {
      namespace = name.split("/").at(0)?.slice(1)!;

      const allowedNamespaces = [
        username,
        ...organizations.map((org) => org.organization.slug),
        environment.VERIFIED_PUBLISHERS.includes(username)
          ? "codemod-com"
          : null,
      ].filter(isNeitherNullNorUndefined);

      if (!allowedNamespaces.includes(namespace)) {
        return reply.code(403).send({
          error: `You are not allowed to publish under namespace "${namespace}"`,
          success: false,
        });
      }
    }

    // private flag in codemodrc as primary source of truth,
    // fallback is to check if publishing under a namespace. if yes - set to private by default
    const isPrivate = codemodRc.private ?? !!namespace;

    if (!isNeitherNullNorUndefined(name)) {
      return reply.code(400).send({
        error: "Codemod name was not provided in codemodrc",
        success: false,
      });
    }

    if (!isNeitherNullNorUndefined(version)) {
      return reply.code(400).send({
        error: "Codemod version was not provided in codemodrc",
        success: false,
      });
    }

    const buffers = [
      {
        name: ".codemodrc.json",
        data: codemodRcBuffer,
      },
    ];

    if (mainFileBuffer && mainFileName) {
      buffers.push({
        name: mainFileName,
        data: mainFileBuffer,
      });
    }

    if (isNeitherNullNorUndefined(descriptionMdBuffer)) {
      buffers.push({
        name: "description.md",
        data: descriptionMdBuffer,
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
        error: `Codemod ${name} version ${version} is lower than the latest published or the same as the latest published version: ${latestVersion.version}`,
        success: false,
      });
    }

    const tarService = new TarService(fs);
    const archive = await tarService.pack(buffers);

    const hashDigest = createHash("ripemd160").update(name).digest("base64url");

    const REQUEST_TIMEOUT = 5000;

    const bucket =
      isPrivate && namespace ? "codemod-private" : "codemod-public";

    const uploadKeyParts = [hashDigest, version, "codemod.tar.gz"];
    if (isPrivate && namespace) {
      uploadKeyParts.unshift(namespace);
    }
    uploadKeyParts.unshift("codemod-registry");
    const uploadKey = uploadKeyParts.join("/");

    const codemodVersionEntry = {
      version,
      s3Bucket: bucket,
      s3UploadKey: uploadKey,
      engine: codemodRc.engine,
      sourceRepo: codemodRc.meta?.git,
      shortDescription: descriptionMdBuffer?.toString("utf-8"),
      vsCodeLink: `vscode://codemod.codemod-vscode-extension/showCodemod?chd=${hashDigest}`,
      applicability: codemodRc.applicability,
      tags: codemodRc.meta?.tags,
      arguments: codemodRc.arguments,
    };

    let isVerified = false;
    let author = namespace;
    if (author === null) {
      if (
        namespace === "codemod-com" ||
        environment.VERIFIED_PUBLISHERS.includes(username)
      ) {
        isVerified = true;
        author = "Codemod";
      } else {
        author = username;
      }
    }

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
        error: `Codemod name \`${name}\` is already taken.`,
        success: false,
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
          shortDescription: descriptionMdBuffer?.toString("utf-8"),
          tags: codemodRc.meta?.tags,
          engine: codemodRc.engine,
          applicability: codemodRc.applicability,
          verified: isVerified,
          private: isPrivate,
          author,
          arguments: codemodRc.arguments,
          versions: {
            create: codemodVersionEntry,
          },
        },
        update: {
          shortDescription: descriptionMdBuffer?.toString("utf-8"),
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
        error: `Failed writing codemod to the database: ${
          (err as Error).message
        }`,
        success: false,
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
          Body: archive,
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
        error: `Failed publishing to S3: ${(err as Error).message}`,
        success: false,
      });
    }

    if (latestVersion === null) {
      try {
        await axios.post(
          "https://hooks.zapier.com/hooks/catch/18983913/2ybuovt/",
          {
            codemod: {
              name,
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
          },
        );
      } catch (err) {
        console.error("Failed calling Zapier hook:", err);
      }
    }

    const revalidate = buildRevalidateHelper(environment);
    await revalidate(name);

    return reply.code(200).send({ success: true });
  } catch (err) {
    console.error(err);
    return reply.code(500).send({
      error: `Failed calling publish endpoint: ${(err as Error).message}`,
      success: false,
    });
  }
};
