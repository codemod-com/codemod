import type * as INodeFs from "node:fs";
import type { FileSystem } from "@codemod-com/utilities";
import { globStream } from "glob";
import type { FlowSettings } from "./schemata/flowSettingsSchema.js";

export async function* buildPathGlobGenerator(
  fileSystem: FileSystem,
  flowSettings: FlowSettings,
  patterns: {
    include: string[];
    exclude: string[];
  },
): AsyncGenerator<string, void, unknown> {
  const stream = globStream(patterns.include, {
    absolute: true,
    cwd: flowSettings.target,
    fs: fileSystem as typeof INodeFs,
    ignore: patterns.exclude,
    nodir: true,
    dot: true,
  });

  for await (const chunk of stream) {
    yield chunk.toString();
  }

  stream.emit("close");
}
