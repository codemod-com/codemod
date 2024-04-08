import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CustomHandler } from "../customHandler.js";
import { parseGetCodemodLatestVersionQuery } from "../schemata/query.js";

export const getCodemodDownloadLink: CustomHandler<{
	link: string;
}> = async (dependencies) => {
	const { name } = parseGetCodemodLatestVersionQuery(
		dependencies.request.query,
	);

	const userId = await dependencies.getClerkUserId();
	const userData = await dependencies.getClerkUserData(userId);

	const { environment } = dependencies;
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

	return dependencies.codemodService.getCodemodDownloadLink(
		name,
		generateSignedUrl,
		userData?.allowedNamespaces,
	);
};
