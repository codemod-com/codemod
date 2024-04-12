import * as S from "@effect/schema/Schema";

// bitwise masks 0x____ZYXX
const NEW_FILE_CREATED = 0;
const OLD_FILE_CHANGED = 1;
const OLD_FILE_DELETED = 2;
const OLD_FILE_COPIED = 3;

const PATH_CHANGED = 1 << 2; // when OLD_FILE_CHANGED set
const DATA_CHANGED = 1 << 3; // when OLD_FILE_CHANGED set

export enum JOB_KIND {
	CREATE_FILE = NEW_FILE_CREATED,
	UPDATE_FILE = OLD_FILE_CHANGED | DATA_CHANGED,
	MOVE_FILE = OLD_FILE_CHANGED | PATH_CHANGED,
	MOVE_AND_UPDATE_FILE = OLD_FILE_CHANGED | PATH_CHANGED | DATA_CHANGED,
	DELETE_FILE = OLD_FILE_DELETED,
	COPY_FILE = OLD_FILE_COPIED,
}

const surfaceAgnosticJobSchema = S.union(
	S.struct({
		kind: S.literal(JOB_KIND.CREATE_FILE),
		jobHashDigest: S.string,
		pathUri: S.string,
		dataUri: S.string,
	}),
	S.struct({
		kind: S.literal(JOB_KIND.UPDATE_FILE),
		jobHashDigest: S.string,
		pathUri: S.string,
		newDataUri: S.string,
	}),
	S.struct({
		kind: S.literal(JOB_KIND.MOVE_FILE),
		jobHashDigest: S.string,
		oldPathUri: S.string,
		newPathUri: S.string,
	}),
	S.struct({
		kind: S.literal(JOB_KIND.MOVE_AND_UPDATE_FILE),
		jobHashDigest: S.string,
		oldPathUri: S.string,
		newPathUri: S.string,
		newDataUri: S.string,
	}),
	S.struct({
		kind: S.literal(JOB_KIND.DELETE_FILE),
		jobHashDigest: S.string,
		pathUri: S.string,
	}),
	S.struct({
		kind: S.literal(JOB_KIND.COPY_FILE),
		jobHashDigest: S.string,
		sourcePathUri: S.string,
		targetPathUri: S.string,
	}),
);

export const parseSurfaceAgnosticJob = S.parseSync(surfaceAgnosticJobSchema);

export type SurfaceAgnosticJob = S.Schema.To<typeof surfaceAgnosticJobSchema>;
