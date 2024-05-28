import * as contexts from "./contexts.js";

export * from "./contexts.js";

import { git } from "./git/git.js";

import { astGrep } from "./astGrep/astGrep.js";

import { jsFiles } from "./jsFiles.js";

import { dirs } from "./fs/dirs.js";

import { codemod } from "./codemod.js";

export { git, astGrep, jsFiles };

export const api = { git, astGrep, jsFiles, contexts, dirs, codemod };

export type Api = typeof api;
