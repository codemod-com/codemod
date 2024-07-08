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

import { question } from "./question.js";

export {
  git,
  astGrep,
  jsFiles,
  contexts,
  dirs,
  codemod,
  getTree,
  files,
  exec,
  question,
};

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
  question,
};

export type Api = typeof api;
