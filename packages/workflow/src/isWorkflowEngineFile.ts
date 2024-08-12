import { files } from "./files.js";

export async function isWorkflowEngineFile(filename: string) {
  return await files(filename).astGrep`module.exports={workflow}`.exists();
}
