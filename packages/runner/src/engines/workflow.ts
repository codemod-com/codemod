import type { ArgumentRecord } from "@codemod-com/utilities";
import type { AuthServiceInterface } from "@codemod.com/workflow";
import { api, setAuthService } from "@codemod.com/workflow";
import type { TransformFunction } from "#source-code.js";

export const runWorkflowCodemod = async (
  workflow: TransformFunction,
  _safeArgumentRecord: ArgumentRecord,
  authService?: AuthServiceInterface,
) => {
  if (authService !== undefined) {
    setAuthService(authService);
  }

  await workflow(api, _safeArgumentRecord);
};
