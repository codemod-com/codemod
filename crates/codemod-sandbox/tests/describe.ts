import { deepStrictEqual } from "node:assert";
import test, { describe } from "node:test";
import { NodeSandbox } from "../src/node.js";
import { DescriberInputs } from "../src/types.js";
import { SandboxedModule } from "../src/module.js";

async function describeModule(
  code: string,
  inputs: DescriberInputs
): Promise<Record<string, unknown>> {
  const module = new SandboxedModule(new NodeSandbox(), {}, { test: code });
  return module.describe("test", inputs);
}

describe("custom describers", () => {
  test("can run", async () => {
    deepStrictEqual(
      await describeModule(
        `
export { describe };

function describe() {
  return { inputSchema: {}, outputSchema: {} }
}

export default function() {
  return { result: foo() }
}`,
        {}
      ),
      { inputSchema: {}, outputSchema: {} }
    );
  });
});
