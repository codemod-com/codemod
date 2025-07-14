import type { SgRoot } from "@ast-grep/napi";
import { registerCodemod } from "../../src/mod.ts";

// Work with `npx codemod@next`
export default async function transform(root: SgRoot): Promise<string> {
  if (true) throw new Error("This is a test error in the workflow codemod");
}

// Register the codemod to use as `node src/transform.ts`
registerCodemod(transform, "TypeScript");
