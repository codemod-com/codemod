import {
  type AllEngines,
  type CodemodListResponse,
  isNeitherNullNorUndefined,
} from "@codemod-com/utilities";
import Fuse from "fuse.js";
import type { Codemod, Prisma, PrismaClient, Tag } from "../../prisma/client";

const parseAndFilterQueryParams = (query: string | string[] | undefined) => {
  const result = [];

  if (!Array.isArray(query)) {
    if (isNeitherNullNorUndefined(query)) {
      result.push(query);
    }
  } else {
    result.push(...query.filter(isNeitherNullNorUndefined));
  }

  return result;
};
const getFrameworkVersion = (codemodName: string) => {
  return codemodName.match(/(\d+(?:\.\d+)*)/)?.[0];
};

const getFrameworks = (frameworkTags: Tag[], codemodTags: string[]) => {
  return frameworkTags
    .filter((tag) => tag.aliases.some((t) => codemodTags.includes(t)))
    .map((tag) => tag.title);
};

const getUseCaseCategory = (
  useCaseCategoryTags: Tag[],
  codemodTags: string[],
) => {
  return useCaseCategoryTags.find((tag) =>
    tag.aliases.some((t) => codemodTags.includes(t)),
  )?.title;
};

type GeneratedCodemodData = {
  frameworks: string[];
  frameworkVersion: string | null | undefined;
  useCaseCategory: string | null | undefined;
};

export type FullCodemodInfo = Codemod & GeneratedCodemodData;

export type Filter = {
  id: string;
  title: string;
  values: Array<{
    id: string;
    title: string;
    count: number;
  }>;
};

export class CodemodNotFoundError extends Error {}

export class CodemodService {
  public constructor(protected prisma: PrismaClient) {}

  public async getCodemods(
    search: string | undefined,
    category: string | string[] | undefined,
    author: string | string[] | undefined,
    framework: string | string[] | undefined,
    verified: boolean | undefined,
    page: number,
    size: number,
  ): Promise<{
    total: number;
    data: FullCodemodInfo[];
    filters: Filter[];
    page: number;
    size: number;
  }> {
    const categories = parseAndFilterQueryParams(category);
    const authors = parseAndFilterQueryParams(author);
    const frameworks = parseAndFilterQueryParams(framework);

    const searchAndFilterClauses: Prisma.CodemodWhereInput["AND"] = [];
    const whereClause: Prisma.CodemodWhereInput = {
      AND: searchAndFilterClauses,
    };

    if (search) {
      searchAndFilterClauses.push({
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            shortDescription: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            author: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          { tags: { has: search } },
        ],
      });
    }

    if (categories.length) {
      searchAndFilterClauses.push({ tags: { hasSome: categories } });
    }

    if (authors.length) {
      searchAndFilterClauses.push({ author: { in: authors } });
    }

    if (frameworks.length) {
      const frameworkAliases: string[] = [];

      const frameworkTags = await this.prisma.tag.findMany({
        where: {
          classification: "framework",
          aliases: { hasSome: frameworks },
        },
      });

      frameworkAliases.push(
        ...frameworkTags.reduce((acc: string[], curr) => {
          acc.push(...curr.aliases);
          return acc;
        }, []),
      );

      searchAndFilterClauses.push({ tags: { hasSome: frameworkAliases } });
    }

    if (isNeitherNullNorUndefined(verified)) {
      searchAndFilterClauses.push({ verified });
    }

    const [codemods, total] = await Promise.all([
      this.prisma.codemod.findMany({
        where: whereClause,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * size,
        take: size,
        include: {
          versions: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      }),
      this.prisma.codemod.count({ where: whereClause }),
    ]);

    const useCaseCategoryTags = await this.prisma.tag.findMany({
      where: { classification: "useCaseCategory" },
    });

    const frameworkTags = await this.prisma.tag.findMany({
      where: { classification: "framework" },
    });

    const data: FullCodemodInfo[] = await Promise.all(
      codemods.map(async (codemod) => {
        const { name, tags } = codemod;

        const frameworkVersion = getFrameworkVersion(name);
        const frameworks = getFrameworks(frameworkTags, tags);
        const useCaseCategory = getUseCaseCategory(useCaseCategoryTags, tags);

        return {
          ...codemod,
          frameworks,
          frameworkVersion,
          useCaseCategory,
        };
      }),
    );

    const authorCounts = await this.prisma.codemod.groupBy({
      by: ["author"],
      _count: {
        author: true,
      },
      where: whereClause,
    });

    const filters: Filter[] = [
      {
        id: "category",
        title: "Use case",
        values: await Promise.all(
          useCaseCategoryTags.map(async (category) => ({
            id: category.title,
            title: category.displayName,
            count: await this.prisma.codemod.count({
              where: {
                AND: [whereClause, { tags: { hasSome: category.aliases } }],
              },
            }),
          })),
        ),
      },
      {
        id: "framework",
        title: "Framework",
        values: await Promise.all(
          frameworkTags.map(async (framework) => {
            const count = await this.prisma.codemod.count({
              where: {
                AND: [whereClause, { tags: { hasSome: framework.aliases } }],
              },
            });
            return {
              id: framework.title,
              title: framework.displayName,
              count,
            };
          }),
        ),
      },
      {
        id: "author",
        title: "Owner",
        values: authorCounts.map((count) => ({
          id: count.author,
          title: count.author,
          count: count._count.author,
        })),
      },
    ];

    return { total, data, filters, page, size };
  }

  public async getCodemodBySlug(slug: string): Promise<FullCodemodInfo> {
    const codemod = await this.prisma.codemod.findFirst({
      where: {
        slug,
      },
      include: {
        versions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!codemod) {
      throw new CodemodNotFoundError();
    }

    const useCaseCategoryTags = await this.prisma.tag.findMany({
      where: { classification: "useCaseCategory" },
    });

    const frameworkTags = await this.prisma.tag.findMany({
      where: { classification: "framework" },
    });

    const { name, tags } = codemod;

    const frameworkVersion = getFrameworkVersion(name);
    const frameworks = getFrameworks(frameworkTags, tags);
    const useCaseCategory = getUseCaseCategory(useCaseCategoryTags, tags);

    return {
      ...codemod,
      frameworks,
      frameworkVersion,
      useCaseCategory,
    };
  }

  public async getCodemodDownloadLink(
    name: string,
    generateSignedUrl:
      | ((
          bucket: string,
          uploadKey: string,
          expireTimeout?: number,
        ) => Promise<string>)
      | null,
    allowedNamespaces?: string[],
  ): Promise<{ link: string; version: string }> {
    const codemod = await this.prisma.codemod.findFirst({
      where: {
        name,
        OR: [{ private: false }, { author: { in: allowedNamespaces } }],
      },
      include: {
        versions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });
    if (!codemod) {
      throw new CodemodNotFoundError();
    }

    const latestVersion = codemod.versions.at(0);
    if (!latestVersion) {
      throw new CodemodNotFoundError();
    }

    let downloadLink = `https://${latestVersion.s3Bucket}.s3.us-west-1.amazonaws.com/${latestVersion.s3UploadKey}`;

    if (codemod.private) {
      if (generateSignedUrl === null) {
        throw new Error(
          `Error generating signed URL for private codemod ${name}`,
        );
      }
      downloadLink = await generateSignedUrl(
        latestVersion.s3Bucket,
        latestVersion.s3UploadKey!,
      );
    }

    return { link: downloadLink, version: latestVersion.version };
  }

  public async getCodemodsList(
    userId: string | null,
    search: string | undefined,
    allowedNamespaces?: string[],
  ): Promise<CodemodListResponse> {
    let codemodData: CodemodListResponse;

    if (isNeitherNullNorUndefined(userId)) {
      const dbCodemods = await this.prisma.codemod.findMany({
        where: {
          OR: [{ private: false }, { author: { in: allowedNamespaces } }],
        },
        include: {
          versions: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      const codemods = dbCodemods.map((codemod) => {
        const latestVersion = codemod.versions?.[0];
        if (!latestVersion) {
          return null;
        }

        return {
          name: codemod.name,
          slug: codemod.slug,
          engine: latestVersion?.engine as AllEngines,
          author: codemod.author,
          tags: latestVersion.tags,
          verified: codemod.verified,
          arguments: codemod.arguments ?? [],
          updatedAt: codemod.updatedAt,
        };
      });

      codemodData = codemods.filter(Boolean);
    } else {
      const dbCodemods = await this.prisma.codemod.findMany({
        include: {
          versions: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      const codemods = dbCodemods.map((codemod) => {
        const latestVersion = codemod.versions?.[0];
        if (!latestVersion) {
          return null;
        }

        return {
          name: codemod.name,
          slug: codemod.slug,
          engine: latestVersion?.engine as AllEngines,
          author: codemod.author,
          tags: latestVersion.tags,
          verified: codemod.verified,
          arguments: codemod.arguments ?? [],
          updatedAt: codemod.updatedAt,
        };
      });

      codemodData = codemods.filter(Boolean);
    }

    if (search) {
      const fuse = new Fuse(codemodData, {
        keys: ["name", "tags"],
        isCaseSensitive: false,
        threshold: 0.35,
      });

      codemodData = fuse.search(search).map((res) => res.item);
    } else {
      codemodData = codemodData.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );
    }

    return codemodData;
  }
}
