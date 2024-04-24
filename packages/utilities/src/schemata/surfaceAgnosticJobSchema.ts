import { type Output, literal, object, parse, string, union } from "valibot";

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

const surfaceAgnosticJobSchema = union([
  object({
    kind: literal(JOB_KIND.CREATE_FILE),
    jobHashDigest: string(),
    pathUri: string(),
    dataUri: string(),
  }),
  object({
    kind: literal(JOB_KIND.UPDATE_FILE),
    jobHashDigest: string(),
    pathUri: string(),
    newDataUri: string(),
  }),
  object({
    kind: literal(JOB_KIND.MOVE_FILE),
    jobHashDigest: string(),
    oldPathUri: string(),
    newPathUri: string(),
  }),
  object({
    kind: literal(JOB_KIND.MOVE_AND_UPDATE_FILE),
    jobHashDigest: string(),
    oldPathUri: string(),
    newPathUri: string(),
    newDataUri: string(),
  }),
  object({
    kind: literal(JOB_KIND.DELETE_FILE),
    jobHashDigest: string(),
    pathUri: string(),
  }),
  object({
    kind: literal(JOB_KIND.COPY_FILE),
    jobHashDigest: string(),
    sourcePathUri: string(),
    targetPathUri: string(),
  }),
]);

export const parseSurfaceAgnosticJob = (input: unknown) =>
  parse(surfaceAgnosticJobSchema, input);

export type SurfaceAgnosticJob = Output<typeof surfaceAgnosticJobSchema>;
