import type { OrganizationMembership } from "./clerk.js";
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

export type GetUserResponse = {
  user: {
    id: string;
    primaryEmail: string;
    username: string;
    firstName: string;
    lastName: string;
    organizations: OrganizationMembership[];
    allowedNamespaces: string[];
  };
};
