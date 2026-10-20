import { ok as assert } from "assert";
import { isRuntimeImportBinding } from "../../../../src/javascript/exports/bindings.ts";
import { requireNode, type SemanticCodemodRoot } from "../_shared.ts";

export default function transform(root: SemanticCodemodRoot) {
  const usage = requireNode(
    root
      .root()
      .find({ rule: { kind: "identifier", pattern: "NS", inside: { kind: "member_expression" } } }),
    "Should find namespace import usage",
  );
  assert(isRuntimeImportBinding(usage), "Namespace import usage should be a runtime binding");
  return null;
}
