import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { CustomHandler } from '../customHandler.js';
import { parseGetCodemodLatestVersionQuery } from '../schemata/schema.js';
import { ALL_CLAIMS } from '../services/tokenService.js';

export let getCodemodDownloadLink: CustomHandler<{
	link: string;
}> = async ({
	getAccessToken,
	tokenService,
	getClerkUserData,
	request,
	environment,
	codemodService,
}) => {
	let { name } = parseGetCodemodLatestVersionQuery(request.query);

	let accessToken = getAccessToken();
	if (accessToken === null) {
		return codemodService.getCodemodDownloadLink(name, null, []);
	}

	let userId: string;
	try {
		userId = await tokenService.findUserIdMetadataFromToken(
			accessToken,
			BigInt(Date.now()),
			ALL_CLAIMS,
		);
	} catch (err) {
		return codemodService.getCodemodDownloadLink(name, null, []);
	}

	let userData = await getClerkUserData(userId);

	let s3Client = new S3Client({
		credentials: {
			accessKeyId: environment.AWS_ACCESS_KEY_ID ?? '',
			secretAccessKey: environment.AWS_SECRET_ACCESS_KEY ?? '',
		},
		region: 'us-west-1',
	});

	let generateSignedUrl = async (
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

	return codemodService.getCodemodDownloadLink(
		name,
		generateSignedUrl,
		userData?.allowedNamespaces,
	);
};
