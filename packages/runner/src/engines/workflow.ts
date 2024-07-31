import type { ArgumentRecord } from "@codemod-com/utilities";
import type * as workflow from "@codemod.com/workflow";
import { api, setAuthService } from "@codemod.com/workflow";
import { getTransformer } from "#source-code.js";

export const runWorkflowCodemod = async (
  codemodSource: string,
  _safeArgumentRecord: ArgumentRecord,
  authService?: workflow.AuthServiceInterface,
) => {
  if (authService !== undefined) {
    setAuthService(authService);
  }

  const workflow = getTransformer(codemodSource);
  if (typeof workflow !== "function" || workflow === null) {
    throw new Error("Invalid workflow source");
  }

  await workflow(api);
};
