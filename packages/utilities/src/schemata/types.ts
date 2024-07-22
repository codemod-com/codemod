import type * as INodeFs from "node:fs";

import type { IFs } from "memfs";

export type FileSystem = IFs | typeof INodeFs;
