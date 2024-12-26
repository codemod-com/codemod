import type { ArgumentRecord } from "@codemod-com/utilities";
import type { AuthServiceInterface } from "@codemod.com/workflow";
// import { api, setAuthService } from "@codemod.com/workflow";
import type { TransformFunction } from "#source-code.js";

export const runWorkflowCodemod = async (
  workflow: TransformFunction,
  safeArgumentRecord: ArgumentRecord,
  authService?: AuthServiceInterface,
) => {
  const workflowEngine = await import("@codemod.com/workflow");
  if (authService !== undefined) {
    workflowEngine.setAuthService(authService);
  }

  return await workflow(workflowEngine.api, safeArgumentRecord);
};
