import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  ApiResponse,
  CodemodDownloadLinkResponse,
} from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import type { FastifyReply, RouteHandler } from "fastify";
import { processHandlerError } from "~/types/errors.js";
import { parseGetCodemodLatestVersionQuery } from "../schemata/schema.js";
import { codemodService } from "../services/CodemodService.js";
import { environment } from "../util.js";

export type GetCodemodDownloadLinkResponse =
  ApiResponse<CodemodDownloadLinkResponse>;

export const getCodemodDownloadLink: RouteHandler<{
  Reply: GetCodemodDownloadLinkResponse;
}> = async (request: UserDataPopulatedRequest, reply: FastifyReply) => {
  const { name } = parseGetCodemodLatestVersionQuery(request.query);

  if (!request?.user?.id) {
    try {
      return await codemodService.getCodemodDownloadLink(name, null, []);
    } catch (err) {
      return processHandlerError(
        err,
        reply,
        "Failed to retrieve codemod download link",
      );
    }
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

  try {
    return await codemodService.getCodemodDownloadLink(
      name,
      generateSignedUrl,
      allowedNamespaces,
    );
  } catch (err) {
    return processHandlerError(
      err,
      reply,
      "Failed to retrieve codemod download link",
    );
  }
};
