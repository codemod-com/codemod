import type { Codemod, CodemodVersion } from "@codemod-com/database";
import type {
  AllEngines,
  Arguments,
  OrganizationMembership,
  User,
} from "@codemod-com/utilities";

export type ApiError = {
  error: string;
  errorText: string;
};

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    "errorText" in value
  );
}

export type ApiResponse<T> = T | ApiError;

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

export type RevokeScopedTokenResponse =
  | { success: true }
  | { success: false; error: string };

export type VerifyTokenResponse = {
  userId: string;
};

export type GetUserDataResponse = {
  user: User;
  organizations: OrganizationMembership[];
  allowedNamespaces: string[];
};

export type GetCodemodResponse = Codemod & { versions: CodemodVersion[] } & {
  frameworks: string[];
  frameworkVersion: string | null | undefined;
  useCaseCategory: string | null | undefined;
};

export type PublishResponse = {
  name: string;
  version: string;
};
