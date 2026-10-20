import { ok as assert } from "assert";
import { isRuntimeImportBinding } from "../../../../src/javascript/exports/bindings.ts";
import type { SemanticCodemodRoot } from "../_shared.ts";

export default function transform(root: SemanticCodemodRoot) {
  const usages = root.root().findAll({
    rule: { kind: "identifier", pattern: "Grid", inside: { kind: "return_statement" } },
  });
  assert(usages.length === 3, "Should find the function, parameter and variable shadow cases");
  for (const usage of usages) {
    assert(
      !isRuntimeImportBinding(usage),
      "A local require callee must not establish an import binding",
    );
  }
  return null;
}
