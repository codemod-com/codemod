import { branch } from "./branch.js";
import { clone } from "./clone.js";
import { commit } from "./commit.js";
import { push } from "./push.js";

export const git = { clone, branch, push, commit };
