import type { KnownEngines } from "@codemod-com/utilities";

export async function detectCodemodEngine(
  filename: string,
): Promise<KnownEngines | undefined> {
  const { isWorkflowEngineFile } = await import("@codemod.com/workflow");
  if (await isWorkflowEngineFile(filename)) {
    return "workflow";
  }
}
