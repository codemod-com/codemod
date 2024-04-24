// Taken from Clerk directly. TODO: investigate how to share these types properly in our monorepo:
// https://linear.app/codemod/issue/CDMD-2777/investigate-sharing-types-across-the-codebase (CDMD-2777)

export type Organization = {
  id: string;
  name: string;
  slug: string | null;
  imageUrl: string;
  hasImage: boolean;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  publicMetadata: { [k: string]: unknown } | null;
  privateMetadata: { [k: string]: unknown };
  maxAllowedMemberships: number;
  adminDeleteEnabled: boolean;
  members_count?: number | undefined;
};

export type ValidateTokenResponse = {
  username: string;
  organizations: Organization[];
};
