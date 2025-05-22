import {
  ConsoleStdout,
  OpenFile,
  WASI,
  File as WasiFile,
} from "@bjorn3/browser_wasi_shim";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import factory from "./factory.js";
import type { ModuleSpec, Sandbox } from "./types.js";
import type { UUID } from "./types.js";

export { NodeSandbox };

async function loadWasmRuntime(): Promise<Buffer> {
  const wasmFile = import.meta.resolve(
    "@codemod-com/codemod-sandbox/sandbox.wasm"
  );
  return readFile(fileURLToPath(wasmFile));
}

class NodeSandbox implements Sandbox {
  private readonly runtimeBuffer: Promise<Buffer>;

  constructor() {
    this.runtimeBuffer = loadWasmRuntime();
  }

  async runModule(
    sessionId: UUID,
    operation: "default" | "describe",
    moduleRegistry: ModuleSpec,
    moduleName: string,
    moduleInputs: Record<string, unknown>
  ) {
    const wasmBytes = await this.runtimeBuffer;
    const moduleCode = moduleRegistry[moduleName];

    if (!moduleCode) {
      return { $error: `Unable to find module "${moduleName}"` };
    }

    const wasiInstance = new WASI(
      [],
      [],
      [
        new OpenFile(new WasiFile([])), // stdin
        ConsoleStdout.lineBuffered((message) =>
          console.log(`[WASI stdout] ${message}`)
        ),
        ConsoleStdout.lineBuffered((message) =>
          console.warn(`[WASI stderr] ${message}`)
        ),
      ]
    );

    const sandboxFactory = factory();
    const { instance } = await WebAssembly.instantiate(wasmBytes, {
      "./codemod-sandbox_bg.js": sandboxFactory,
      wasi_snapshot_preview1: wasiInstance.wasiImport,
    });

    sandboxFactory.__wbg_set_wasm(instance.exports);
    // @ts-expect-error 2739
    wasiInstance.start({ exports: instance.exports });

    const executionResult = await sandboxFactory.run_module(
      sessionId,
      operation,
      moduleName,
      moduleRegistry,
      moduleCode,
      JSON.stringify(moduleInputs)
    );

    return JSON.parse(executionResult);
  }
}
