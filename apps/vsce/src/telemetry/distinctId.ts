/**
 * We need to assign unique identifier for users that are not signed in
 */

import { randomBytes } from "node:crypto";
import type { ExtensionContext } from "vscode";

const getDistinctId = async (context: ExtensionContext) => {
  return (await context.globalState.get<string>("distinctUserId")) ?? null;
};

const generateDistinctId = async (context: ExtensionContext) => {
  const distinctId = randomBytes(16).toString("hex");

  await context.globalState.update("distinctUserId", distinctId);

  return distinctId;
};

export { getDistinctId, generateDistinctId };
