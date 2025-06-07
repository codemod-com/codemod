import { deepStrictEqual, rejects } from "node:assert";
import test, { describe } from "node:test";
import { NodeSandbox } from "../js/node.js";
import { SandboxedModule } from "../js/module.js";

async function run(
  modules: Record<string, string>,
  inputs: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  const module = new SandboxedModule(new NodeSandbox(), {}, modules);
  return module.invoke("test", inputs);
}

describe("peer module import", () => {
  test("can import a peer module", async () => {
    deepStrictEqual(
      await run({
        foo: `export function foo() { return "HELLO"; }`,
        test: `import { foo } from "./foo";
        export default function() {
        return { result: foo() }
      }`,
      }),
      { result: "HELLO" }
    );
  });

  test("can import default peer module import", async () => {
    deepStrictEqual(
      await run({
        foo: `export default function() { return "HELLO"; }`,
        test: `import foo from "./foo";
        export default function() {
        return { result: foo() }
      }`,
      }),
      { result: "HELLO" }
    );
  });

  test('can import peer modules with ".js" suffix', async () => {
    deepStrictEqual(
      await run({
        foo: `export default function() { return "HELLO"; }`,
        test: `import foo from "./foo.js";
        export default function() {
        return { result: foo() }
      }`,
      }),
      { result: "HELLO" }
    );
  });

  test("supports nested imports", async () => {
    deepStrictEqual(
      await run({
        bar: `import foo from "./foo";
          export default function() {
            return \`HELLO \${foo()}\`;
          };`,
        foo: `export default function() { return "HELLO"; }`,
        test: `import bar from "./bar";
        export default function() {
        return { result: bar() }
      }`,
      }),
      { result: "HELLO HELLO" }
    );
  });

  test("can't import itself", async () => {
    await rejects(() =>
      run({
        test: `import foo from "./test";
      export default function() {
      return { result: foo() }
    }`,
      })
    );

    await rejects(() =>
      run({
        bar: `import foo from "./test";
          export default function() {
            return \`HELLO \${foo()}\`;
          };`,
        test: `import foo from "./bar";
      export default function() {
      return { result: foo() }
    }`,
      })
    );
  });
});
