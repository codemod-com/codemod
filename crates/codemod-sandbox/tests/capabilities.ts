import { deepStrictEqual } from "node:assert";
import test, { describe } from "node:test";
import { NodeSandbox } from "../src/node.js";
import { SandboxedModule } from "../src/module.js";

async function run(
  code: string,
  inputs: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  const module = new SandboxedModule(
    new NodeSandbox(),
    {
      fetch: async (inputs) => inputs,
      invoke: async (inputs) => inputs,
      secrets: async (inputs) => inputs,
    },
    { test: code }
  );
  const outputs = await module.invoke("test", inputs);
  return outputs;
}

describe("can import capabilities", () => {
  test('can import "@fetch" module', async () => {
    const result = await run(`import fetch from "@fetch";
      export default function() {
        return { fetch: typeof fetch }
      }`);
    deepStrictEqual(result, { fetch: "function" });
  });

  test('can call fetch from "@fetch"', async () => {
    const result = await run(`import fetch from "@fetch";
    export default async function() {
      return { result: await fetch({ test: "HELLO" }) }
    }
      `);
    deepStrictEqual(result, { result: { test: "HELLO" } });
  });

  test('can call secrets from "@secrets"', async () => {
    const result = await run(`import secrets from "@secrets";
    export default async function() {
      return { result: await secrets({ test: "HELLO" }) }
    }
      `);
    deepStrictEqual(result, { result: { test: "HELLO" } });
  });

  test('can call secrets from "@invoke"', async () => {
    const result = await run(`import invoke from "@invoke";
    export default async function() {
      return { result: await invoke({ test: "HELLO" }) }
    }
      `);
    deepStrictEqual(result, { result: { test: "HELLO" } });
  });
});
