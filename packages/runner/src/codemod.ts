import type {
  ArgumentRecord,
  Arguments,
  EngineOptions,
  KnownEngines,
} from "@codemod-com/utilities";

export type Codemod =
  | Readonly<{
      source: "package";
      name: string;
      version: string;
      include?: string[];
      engine: "recipe";
      directoryPath: string;
      codemods: ReadonlyArray<CodemodToRun>;
      arguments: Arguments;
    }>
  | Readonly<{
      source: "package";
      name: string;
      version: string;
      include?: string[];
      engine: KnownEngines;
      directoryPath: string;
      indexPath: string;
      arguments: Arguments;
    }>
  | Readonly<{
      source: "package";
      name: string;
      version: string;
      include?: string[];
      engine: "piranha";
      directoryPath: string;
      arguments: Arguments;
    }>
  | Readonly<{
      source: "standalone";
      include?: string[];
      engine: KnownEngines;
      indexPath: string;
    }>;

export type CodemodToRun = Codemod & {
  codemodSource: "local" | "registry";
  safeArgumentRecord: ArgumentRecord;
  hashDigest?: Buffer;
  engineOptions: EngineOptions | null;
};
