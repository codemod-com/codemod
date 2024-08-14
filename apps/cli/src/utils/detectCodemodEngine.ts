import type { KnownEngines } from "@codemod-com/utilities";
import { isWorkflowEngineFile } from "@codemod.com/workflow";

export async function detectCodemodEngine(
  filename: string,
): Promise<KnownEngines | undefined> {
  if (await isWorkflowEngineFile(filename)) {
    return "workflow";
  }
}
