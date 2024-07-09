import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  type ApiResponse,
  CODEMOD_NOT_FOUND,
  type CodemodDownloadLinkResponse,
  INTERNAL_SERVER_ERROR,
} from "@codemod-com/utilities";
import type { FastifyReply, RouteHandler } from "fastify";
import { CodemodNotFoundError } from "~/types/errors.js";
import type { UserDataPopulatedRequest } from "../plugins/authPlugin.js";
import { parseGetCodemodLatestVersionQuery } from "../schemata/schema.js";
import { codemodService } from "../services/CodemodService.js";
import { environment } from "../util.js";

const retrieveCodemodDownloadLink = async (
  reply: FastifyReply,
  ...opts: Parameters<typeof codemodService.getCodemodDownloadLink>
) => {
  try {
    return await codemodService.getCodemodDownloadLink(...opts);
  } catch (err) {
    if (err instanceof CodemodNotFoundError) {
      return reply.status(400).send({
        error: CODEMOD_NOT_FOUND,
        errorText: "Codemod not found",
      });
    }

    return reply.status(500).send({
      error: INTERNAL_SERVER_ERROR,
      errorText: "Failed to retrieve codemod download link",
    });
  }
};

export const getCodemodDownloadLink: RouteHandler<{
  Reply: ApiResponse<CodemodDownloadLinkResponse>;
}> = async (request: UserDataPopulatedRequest, reply: FastifyReply) => {
  const { name } = parseGetCodemodLatestVersionQuery(request.query);

  if (!request?.user?.id) {
    return retrieveCodemodDownloadLink(reply, name, null, []);
  }

  const allowedNamespaces = request?.allowedNamespaces;

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: environment.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: environment.AWS_SECRET_ACCESS_KEY ?? "",
    },
    region: "us-west-1",
  });

  const generateSignedUrl = async (
    bucket: string,
    uploadKey: string,
    expireTimeout?: number,
  ) => {
    return getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: bucket, Key: uploadKey }),
      { expiresIn: expireTimeout ?? 30 },
    );
  };

  return retrieveCodemodDownloadLink(
    reply,
    name,
    generateSignedUrl,
    allowedNamespaces,
  );
};
