import type { OrganizationMembership, User } from "./clerk.js";
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

export type CodemodDownloadLinkResponse = {
  link: string;
  version: string;
};

export type GetScopedTokenResponse = { token: string };

export type VerifyCLITokenResponse = {
  user: User;
  organizations: OrganizationMembership[];
  allowedNamespaces: string[];
};
