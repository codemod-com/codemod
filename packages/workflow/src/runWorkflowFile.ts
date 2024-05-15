import * as path from "node:path";
import * as tsImport from "ts-import";
import { runMigrations } from "./codemod";

export const runWorkflowFile = async (relativePath: string) => {
  const absolutePath = path.join(process.cwd(), relativePath);
  tsImport.loadSync(absolutePath, {
    transpileOptions: {
      cache: {
        dir: path.join(process.cwd(), "node_modules", ".workflow-cache"),
      },
    },
  });
  await runMigrations();
};
