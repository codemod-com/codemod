import type { AllEngines, Arguments } from "./codemodConfigSchema.js";

export type CodemodListResponse = {
  name: string;
  slug: string;
  author: string;
  engine: AllEngines;
  tags: string[];
  verified: boolean;
  arguments: Arguments;
  updatedAt: Date;
}[];
