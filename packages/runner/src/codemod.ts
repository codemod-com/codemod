import type {
  ArgumentRecord,
  Arguments,
  EngineOptions,
  KnownEngines,
} from "@codemod-com/utilities";
import type { FormattedFileCommand } from "./fileCommands";

export type RecipeCodemod = Readonly<{
  bundleType: "package";
  source: "local" | "registry";
  name: string;
  version: string;
  include?: string[];
  engine: "recipe";
  directoryPath: string;
  codemods: Codemod[];
  arguments: Arguments;
}>;

export type KnownEngineCodemod = Readonly<{
  bundleType: "package";
  source: "local" | "registry";
  name: string;
  version: string;
  include?: string[];
  engine: KnownEngines;
  directoryPath: string;
  indexPath: string;
  arguments: Arguments;
}>;

export type PiranhaCodemod = Readonly<{
  bundleType: "package";
  source: "local" | "registry";
  name: string;
  version: string;
  include?: string[];
  engine: "piranha";
  directoryPath: string;
  arguments: Arguments;
}>;

export type StandaloneCodemod = Readonly<{
  bundleType: "standalone";
  source: "local" | "registry";
  include?: string[];
  engine: KnownEngines;
  indexPath: string;
}>;

export type Codemod =
  | RecipeCodemod
  | KnownEngineCodemod
  | PiranhaCodemod
  | StandaloneCodemod;

export type CodemodToRunBase =
  | (Omit<RecipeCodemod, "codemods"> & { codemods: CodemodToRun[] })
  | KnownEngineCodemod
  | PiranhaCodemod
  | StandaloneCodemod;

export type CodemodToRun = CodemodToRunBase & {
  safeArgumentRecord: ArgumentRecord;
  cleanup?: boolean;
  hashDigest?: Buffer;
  engineOptions: EngineOptions | null;
};

export type RunResult = {
  codemod: CodemodToRun;
  commands: FormattedFileCommand[];
  recipe?: CodemodToRun & { engine: "recipe" };
};
