import {
	type AllEngines,
	type CodemodListResponse,
	isNeitherNullNorUndefined,
} from '@codemod-com/utilities';
import Fuse from 'fuse.js';
import type { Codemod, Prisma, PrismaClient, Tag } from '../../prisma/client';

let parseAndFilterQueryParams = (query: string | string[] | undefined) => {
	let result = [];

	if (!Array.isArray(query)) {
		if (isNeitherNullNorUndefined(query)) {
			result.push(query);
		}
	} else {
		result.push(...query.filter(isNeitherNullNorUndefined));
	}

	return result;
};
let getFrameworkVersion = (codemodName: string) => {
	return codemodName.match(/(\d+(?:\.\d+)*)/)?.[0];
};

let getFrameworks = (frameworkTags: Tag[], codemodTags: string[]) => {
	return frameworkTags
		.filter((tag) => tag.aliases.some((t) => codemodTags.includes(t)))
		.map((tag) => tag.title);
};

let getUseCaseCategory = (
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
		let categories = parseAndFilterQueryParams(category);
		let authors = parseAndFilterQueryParams(author);
		let frameworks = parseAndFilterQueryParams(framework);

		let searchAndFilterClauses: Prisma.CodemodWhereInput['AND'] = [];
		let whereClause: Prisma.CodemodWhereInput = {
			AND: searchAndFilterClauses,
		};

		if (search) {
			searchAndFilterClauses.push({
				OR: [
					{
						name: {
							contains: search,
							mode: 'insensitive' as Prisma.QueryMode,
						},
					},
					{
						shortDescription: {
							contains: search,
							mode: 'insensitive' as Prisma.QueryMode,
						},
					},
					{
						author: {
							contains: search,
							mode: 'insensitive' as Prisma.QueryMode,
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
			let frameworkAliases: string[] = [];

			let frameworkTags = await this.prisma.tag.findMany({
				where: {
					classification: 'framework',
					aliases: { hasSome: frameworks },
				},
			});

			frameworkAliases.push(
				...frameworkTags.reduce((acc: string[], curr) => {
					acc.push(...curr.aliases);
					return acc;
				}, []),
			);

			searchAndFilterClauses.push({
				tags: { hasSome: frameworkAliases },
			});
		}

		if (isNeitherNullNorUndefined(verified)) {
			searchAndFilterClauses.push({ verified });
		}

		let [codemods, total] = await Promise.all([
			this.prisma.codemod.findMany({
				where: whereClause,
				orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
				skip: (page - 1) * size,
				take: size,
				include: {
					versions: {
						orderBy: {
							createdAt: 'desc',
						},
						take: 1,
					},
				},
			}),
			this.prisma.codemod.count({ where: whereClause }),
		]);

		let useCaseCategoryTags = await this.prisma.tag.findMany({
			where: { classification: 'useCaseCategory' },
		});

		let frameworkTags = await this.prisma.tag.findMany({
			where: { classification: 'framework' },
		});

		let data: FullCodemodInfo[] = await Promise.all(
			codemods.map(async (codemod) => {
				let { name, tags } = codemod;

				let frameworkVersion = getFrameworkVersion(name);
				let frameworks = getFrameworks(frameworkTags, tags);
				let useCaseCategory = getUseCaseCategory(
					useCaseCategoryTags,
					tags,
				);

				return {
					...codemod,
					frameworks,
					frameworkVersion,
					useCaseCategory,
				};
			}),
		);

		let authorCounts = await this.prisma.codemod.groupBy({
			by: ['author'],
			_count: {
				author: true,
			},
			where: whereClause,
		});

		let filters: Filter[] = [
			{
				id: 'category',
				title: 'Use case',
				values: await Promise.all(
					useCaseCategoryTags.map(async (category) => ({
						id: category.title,
						title: category.displayName,
						count: await this.prisma.codemod.count({
							where: {
								AND: [
									whereClause,
									{ tags: { hasSome: category.aliases } },
								],
							},
						}),
					})),
				),
			},
			{
				id: 'framework',
				title: 'Framework',
				values: await Promise.all(
					frameworkTags.map(async (framework) => {
						let count = await this.prisma.codemod.count({
							where: {
								AND: [
									whereClause,
									{ tags: { hasSome: framework.aliases } },
								],
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
				id: 'author',
				title: 'Owner',
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
		let codemod = await this.prisma.codemod.findFirst({
			where: {
				slug,
			},
			include: {
				versions: {
					orderBy: {
						createdAt: 'desc',
					},
				},
			},
		});

		if (!codemod) {
			throw new CodemodNotFoundError();
		}

		let useCaseCategoryTags = await this.prisma.tag.findMany({
			where: { classification: 'useCaseCategory' },
		});

		let frameworkTags = await this.prisma.tag.findMany({
			where: { classification: 'framework' },
		});

		let { name, tags } = codemod;

		let frameworkVersion = getFrameworkVersion(name);
		let frameworks = getFrameworks(frameworkTags, tags);
		let useCaseCategory = getUseCaseCategory(useCaseCategoryTags, tags);

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
		let codemod = await this.prisma.codemod.findFirst({
			where: {
				name,
				OR: [{ private: false }, { author: { in: allowedNamespaces } }],
			},
			include: {
				versions: {
					orderBy: {
						createdAt: 'desc',
					},
					take: 1,
				},
			},
		});
		if (!codemod) {
			throw new CodemodNotFoundError();
		}

		let latestVersion = codemod.versions.at(0);
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
			let dbCodemods = await this.prisma.codemod.findMany({
				where: {
					OR: [
						{ private: false },
						{ author: { in: allowedNamespaces } },
					],
				},
				include: {
					versions: {
						orderBy: {
							createdAt: 'desc',
						},
						take: 1,
					},
				},
			});

			let codemods = dbCodemods.map((codemod) => {
				let latestVersion = codemod.versions?.[0];
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
			let dbCodemods = await this.prisma.codemod.findMany({
				include: {
					versions: {
						orderBy: {
							createdAt: 'desc',
						},
						take: 1,
					},
				},
			});

			let codemods = dbCodemods.map((codemod) => {
				let latestVersion = codemod.versions?.[0];
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
			let fuse = new Fuse(codemodData, {
				keys: ['name', 'tags'],
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
