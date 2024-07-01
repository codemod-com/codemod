import * as contexts from "./contexts.js";

export * from "./contexts.js";

import { git } from "./git/git.js";

import { astGrep } from "./astGrep/astGrep.js";

import { jsFiles } from "./jsFiles.js";

import { dirs } from "./fs/dirs.js";

import { codemod } from "./codemod.js";

import { getTree } from "./engineHelpers.js";

import { files } from "./files.js";

import { exec } from "./exec.js";

export { git, astGrep, jsFiles, files, codemod, dirs, exec };

export const api = {
  git,
  astGrep,
  jsFiles,
  contexts,
  dirs,
  codemod,
  getTree,
  files,
  exec,
};

export type Api = typeof api;
