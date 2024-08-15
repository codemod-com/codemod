import { files } from "./files.js";

export async function isWorkflowEngineFile(filename: string) {
  const maybeWorkflowFiles = files(filename);
  return (
    (await maybeWorkflowFiles.astGrep`module.exports={workflow}`.exists()) ||
    (await maybeWorkflowFiles.astGrep`
rule:
  pattern:
    context: "{ workflow: () => $B }"
`.exists())
  );
}
