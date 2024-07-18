import type { FileCommand } from "@codemod-com/utilities";

export type NamedFileCommand = FileCommand & {
  codemodName: string;
};
