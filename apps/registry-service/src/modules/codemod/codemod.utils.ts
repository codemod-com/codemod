import {
  type OrganizationMembership,
  type User,
  createClerkClient,
} from "@clerk/backend";
import type { Prisma } from "@codemod-com/database";
import { isNeitherNullNorUndefined } from "../../../../../packages/utilities/dist";

const AUTHOR_ID = "author";
const AUTHOR_TITLE = "Owner";

const FRAMEWORK_ID = "framework";
const FRAMEWORK_TITLE = "Framework";

const USE_CASE_CATEGORY_ID = "category";
const USE_CASE_CATEGORY_TITLE = "Use case";

type GroupByAuthorFilterOutput = {
  author: string;
  _count: {
    author: number;
  };
};

type GroupByFrameworksFilterOutput = {
  id: string;
  title: string;
  count: number;
};

type GroupByUseCaseCategoryFilterOutput = {
  id: string;
  title: string;
  count: number;
};

export const generateDynamicFilters = (
  authorCounts: GroupByAuthorFilterOutput[],
  frameworksCounts: GroupByFrameworksFilterOutput[],
  useCaseCategoryCounts: GroupByUseCaseCategoryFilterOutput[],
) => {
  return [
    {
      id: AUTHOR_ID,
      title: AUTHOR_TITLE,
      values: authorCounts.map(({ author, _count }) => ({
        id: author,
        title: author,
        count: _count.author,
      })),
    },
    {
      id: FRAMEWORK_ID,
      title: FRAMEWORK_TITLE,
      values: frameworksCounts,
    },
    {
      id: USE_CASE_CATEGORY_ID,
      title: USE_CASE_CATEGORY_TITLE,
      values: useCaseCategoryCounts,
    },
  ];
};

const getClerkUserData = async (
  userId: string,
): Promise<{
  user: User;
} | null> => {
  const clerkClient = createClerkClient({
    publishableKey: process.env.CLERK_PUBLISH_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
    jwtKey: process.env.CLERK_JWT_KEY,
  });
  if (clerkClient === null) {
    return null;
  }

  const user = await clerkClient.users.getUser(userId);
  const userOrganizations =
    await clerkClient.users.getOrganizationMembershipList({ userId });

  const userAllowedNamespaces = [
    ...userOrganizations.map((org) => org.organization.slug),
  ].filter(isNeitherNullNorUndefined);

  return {
    user,
  };
};
