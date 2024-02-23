import type { CaseHash } from "../cases/types";
import { buildUriHash } from "../uris/buildUriHash";
import { buildHash } from "../utilities";
import type { Job, JobHash } from "./types";

export const buildJobHash = (
	hashlessJob: Omit<Job, "hash">,
	caseHashDigest: CaseHash,
): JobHash => {
	return buildHash(
		[
			caseHashDigest,
			hashlessJob.kind,
			hashlessJob.oldUri ? buildUriHash(hashlessJob.oldUri) : "",
			hashlessJob.newUri ? buildUriHash(hashlessJob.newUri) : "",
			hashlessJob.newContentUri ? buildUriHash(hashlessJob.newContentUri) : "",
			hashlessJob.codemodName,
		].join(","),
	) as JobHash;
};
