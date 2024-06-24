import type { OrganizationMembership, User } from "./clerk.js";
import type { AllEngines, Arguments } from "./codemodConfigSchema.js";

export type CodemodListResponse = {
  name: string;
  slug: string;
  author: string;
  engine: AllEngines;
  tags: string[];
  verified: any;
  arguments: Arguments;
  updatedAt: Date;
}[];

export type CodemodDownloadLinkResponse = {
  link: string;
  version: string;
};

export type GetScopedTokenResponse = { token: string };

export type VerifyTokenResponse = {
  userId: string;
};

export type GetUserDataResponse = {
  user: User;
  organizations: OrganizationMembership[];
  allowedNamespaces: string[];
};
