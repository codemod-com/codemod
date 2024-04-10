import { isNeitherNullNorUndefined } from "@codemod-com/utilities";
import { Codemod, CodemodVersion, Prisma, PrismaClient } from "@prisma/client";
import Fuse from "fuse.js";

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

type LongCodemodIndoDetails = {
	framework: string | null | undefined;
	useCaseCategory: string | null | undefined;
};

export type LongCodemodInfo = Codemod & LongCodemodIndoDetails;

export type ShortCodemodInfo = Pick<Codemod, "name" | "author" | "slug"> &
	Pick<CodemodVersion, "engine">;

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
		data: LongCodemodInfo[];
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

		const data: LongCodemodInfo[] = await Promise.all(
			codemods.map(async (codemod) => {
				const useCaseCategory = useCaseCategoryTags.find((tag) =>
					tag.aliases.some((t) => codemod.tags.includes(t)),
				)?.title;
				const framework = frameworkTags.find((tag) =>
					tag.aliases.some((t) => codemod.tags.includes(t)),
				)?.title;

				return {
					...codemod,
					framework: framework ?? "",
					useCaseCategory: useCaseCategory ?? "",
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
				title: "Use case category",
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
				title: "Frameworks",
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
				title: "Author",
				values: authorCounts.map((count) => ({
					id: count.author,
					title: count.author,
					count: count._count.author,
				})),
			},
		];

		return { total, data, filters, page, size };
	}

	public async getCodemodBySlug(slug: string): Promise<Codemod> {
		const codemod = await this.prisma.codemod.findFirst({
			where: {
				slug,
			},
			include: {
				versions: true,
			},
		});

		if (!codemod) {
			throw new CodemodNotFoundError();
		}

		return codemod;
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
	): Promise<{ link: string }> {
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

		return { link: downloadLink };
	}

	public async getCodemodsList(
		userId: string | null,
		search: string | undefined,
		allowedNamespaces?: string[],
	): Promise<ShortCodemodInfo[]> {
		let codemodData: ShortCodemodInfo[];

		if (isNeitherNullNorUndefined(userId)) {
			const dbCodemods = await this.prisma.codemod.findMany({
				where: {
					OR: [{ private: false }, { author: { in: allowedNamespaces } }],
				},
			});

			const codemods = await Promise.all(
				dbCodemods.map(async (codemod) => {
					const latestVersion = await this.prisma.codemodVersion.findFirst({
						where: {
							codemodId: codemod.id,
						},
						orderBy: {
							createdAt: "desc",
						},
					});

					if (!latestVersion) {
						return null;
					}

					return {
						name: codemod.name,
						slug: codemod.slug,
						engine: latestVersion?.engine,
						author: codemod.author,
						tags: latestVersion.tags,
						verified: codemod.verified,
						arguments: codemod.arguments,
					};
				}),
			);

			codemodData = codemods.filter(Boolean);
		} else {
			const dbCodemods = await this.prisma.codemod.findMany();

			const codemods = await Promise.all(
				dbCodemods.map(async (codemod) => {
					const latestVersion = await this.prisma.codemodVersion.findFirst({
						where: {
							codemodId: codemod.id,
						},
						orderBy: {
							createdAt: "desc",
						},
					});

					if (!latestVersion) {
						return null;
					}

					return {
						name: codemod.name,
						slug: codemod.slug,
						engine: latestVersion?.engine,
						author: codemod.author,
						tags: latestVersion.tags,
						verified: codemod.verified,
						arguments: codemod.arguments,
					};
				}),
			);

			codemodData = codemods.filter(Boolean);
		}

		if (search) {
			const fuse = new Fuse(codemodData, {
				keys: ["name", "tags"],
				isCaseSensitive: false,
				threshold: 0.35,
			});

			codemodData = fuse.search(search).map((res) => res.item);
		}

		return codemodData;
	}
}
