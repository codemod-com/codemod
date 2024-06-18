import type {
  ArgumentRecord,
  Arguments,
  EngineOptions,
  KnownEngines,
} from "@codemod-com/utilities";
import type { FormattedFileCommand } from "./fileCommands";

export type Codemod =
  | Readonly<{
      bundleType: "package";
      source: "local" | "registry";
      name: string;
      version: string;
      include?: string[];
      engine: "recipe";
      directoryPath: string;
      codemods: ReadonlyArray<Codemod>;
      arguments: Arguments;
    }>
  | Readonly<{
      bundleType: "package";
      source: "local" | "registry";
      name: string;
      version: string;
      include?: string[];
      engine: KnownEngines;
      directoryPath: string;
      indexPath: string;
      arguments: Arguments;
    }>
  | Readonly<{
      bundleType: "package";
      source: "local" | "registry";
      name: string;
      version: string;
      include?: string[];
      engine: "piranha";
      directoryPath: string;
      arguments: Arguments;
    }>
  | Readonly<{
      bundleType: "standalone";
      source: "local" | "registry";
      include?: string[];
      engine: KnownEngines;
      indexPath: string;
    }>;

export type CodemodToRun = Codemod & {
  safeArgumentRecord: ArgumentRecord;
  hashDigest?: Buffer;
  engineOptions: EngineOptions | null;
};

export type RunResult = {
  codemod: Codemod;
  commands: FormattedFileCommand[];
  recipe?: Codemod & { engine: "recipe" };
};
