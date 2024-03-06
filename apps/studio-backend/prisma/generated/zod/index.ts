import type { Prisma } from "@prisma/client";
import { z } from "zod";

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum([
	"ReadUncommitted",
	"ReadCommitted",
	"RepeatableRead",
	"Serializable",
]);

export const CodemodScalarFieldEnumSchema = z.enum([
	"id",
	"slug",
	"name",
	"shortDescription",
	"type",
	"private",
	"featured",
	"verified",
	"author",
	"engine",
	"version",
	"command",
	"vsCodeLink",
	"codemodStudioExampleLink",
	"testProjectCommand",
	"sourceRepo",
	"amountOfUses",
	"totalTimeSaved",
	"openedPrs",
	"labels",
	"readmeLink",
	"indexTsLink",
	"framework",
	"frameworkVersion",
	"userStories",
	"requirements",
	"createdAt",
	"lastUpdate",
]);

export const SortOrderSchema = z.enum(["asc", "desc"]);

export const QueryModeSchema = z.enum(["default", "insensitive"]);

export const NullsOrderSchema = z.enum(["first", "last"]);

export const CodemodTypeSchema = z.enum(["recipe", "codemod"]);

export type CodemodTypeType = `${z.infer<typeof CodemodTypeSchema>}`;

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// CODEMOD SCHEMA
/////////////////////////////////////////

export const CodemodSchema = z.object({
	type: CodemodTypeSchema,
	id: z.number().int(),
	slug: z.string(),
	name: z.string(),
	shortDescription: z.string(),
	private: z.boolean(),
	featured: z.boolean(),
	verified: z.boolean(),
	author: z.string(),
	engine: z.string(),
	version: z.string(),
	command: z.string(),
	vsCodeLink: z.string(),
	codemodStudioExampleLink: z.string(),
	testProjectCommand: z.string(),
	sourceRepo: z.string(),
	amountOfUses: z.number().int(),
	totalTimeSaved: z.number().int(),
	openedPrs: z.number().int(),
	labels: z.string().array(),
	readmeLink: z.string(),
	indexTsLink: z.string(),
	framework: z.string().nullable(),
	frameworkVersion: z.string().nullable(),
	userStories: z.string().nullable(),
	requirements: z.string().nullable(),
	createdAt: z.coerce.date(),
	lastUpdate: z.coerce.date(),
});

export type Codemod = z.infer<typeof CodemodSchema>;

// CODEMOD OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CodemodOptionalDefaultsSchema = CodemodSchema.merge(
	z.object({
		id: z.number().int().optional(),
		featured: z.boolean().optional(),
		amountOfUses: z.number().int().optional(),
		totalTimeSaved: z.number().int().optional(),
		openedPrs: z.number().int().optional(),
		labels: z.string().array().optional(),
		createdAt: z.coerce.date().optional(),
		lastUpdate: z.coerce.date().optional(),
	}),
);

export type CodemodOptionalDefaults = z.infer<
	typeof CodemodOptionalDefaultsSchema
>;

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// CODEMOD
//------------------------------------------------------

export const CodemodSelectSchema: z.ZodType<Prisma.CodemodSelect> = z
	.object({
		id: z.boolean().optional(),
		slug: z.boolean().optional(),
		name: z.boolean().optional(),
		shortDescription: z.boolean().optional(),
		type: z.boolean().optional(),
		private: z.boolean().optional(),
		featured: z.boolean().optional(),
		verified: z.boolean().optional(),
		author: z.boolean().optional(),
		engine: z.boolean().optional(),
		version: z.boolean().optional(),
		command: z.boolean().optional(),
		vsCodeLink: z.boolean().optional(),
		codemodStudioExampleLink: z.boolean().optional(),
		testProjectCommand: z.boolean().optional(),
		sourceRepo: z.boolean().optional(),
		amountOfUses: z.boolean().optional(),
		totalTimeSaved: z.boolean().optional(),
		openedPrs: z.boolean().optional(),
		labels: z.boolean().optional(),
		readmeLink: z.boolean().optional(),
		indexTsLink: z.boolean().optional(),
		framework: z.boolean().optional(),
		frameworkVersion: z.boolean().optional(),
		userStories: z.boolean().optional(),
		requirements: z.boolean().optional(),
		createdAt: z.boolean().optional(),
		lastUpdate: z.boolean().optional(),
	})
	.strict();

/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const CodemodWhereInputSchema: z.ZodType<Prisma.CodemodWhereInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => CodemodWhereInputSchema),
				z.lazy(() => CodemodWhereInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => CodemodWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => CodemodWhereInputSchema),
				z.lazy(() => CodemodWhereInputSchema).array(),
			])
			.optional(),
		id: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		slug: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		shortDescription: z
			.union([z.lazy(() => StringFilterSchema), z.string()])
			.optional(),
		type: z
			.union([
				z.lazy(() => EnumCodemodTypeFilterSchema),
				z.lazy(() => CodemodTypeSchema),
			])
			.optional(),
		private: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		featured: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		verified: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		author: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		engine: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		version: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		command: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		vsCodeLink: z
			.union([z.lazy(() => StringFilterSchema), z.string()])
			.optional(),
		codemodStudioExampleLink: z
			.union([z.lazy(() => StringFilterSchema), z.string()])
			.optional(),
		testProjectCommand: z
			.union([z.lazy(() => StringFilterSchema), z.string()])
			.optional(),
		sourceRepo: z
			.union([z.lazy(() => StringFilterSchema), z.string()])
			.optional(),
		amountOfUses: z
			.union([z.lazy(() => IntFilterSchema), z.number()])
			.optional(),
		totalTimeSaved: z
			.union([z.lazy(() => IntFilterSchema), z.number()])
			.optional(),
		openedPrs: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		labels: z.lazy(() => StringNullableListFilterSchema).optional(),
		readmeLink: z
			.union([z.lazy(() => StringFilterSchema), z.string()])
			.optional(),
		indexTsLink: z
			.union([z.lazy(() => StringFilterSchema), z.string()])
			.optional(),
		framework: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		frameworkVersion: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		userStories: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		requirements: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		createdAt: z
			.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()])
			.optional(),
		lastUpdate: z
			.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()])
			.optional(),
	})
	.strict();

export const CodemodOrderByWithRelationInputSchema: z.ZodType<Prisma.CodemodOrderByWithRelationInput> =
	z
		.object({
			id: z.lazy(() => SortOrderSchema).optional(),
			slug: z.lazy(() => SortOrderSchema).optional(),
			name: z.lazy(() => SortOrderSchema).optional(),
			shortDescription: z.lazy(() => SortOrderSchema).optional(),
			type: z.lazy(() => SortOrderSchema).optional(),
			private: z.lazy(() => SortOrderSchema).optional(),
			featured: z.lazy(() => SortOrderSchema).optional(),
			verified: z.lazy(() => SortOrderSchema).optional(),
			author: z.lazy(() => SortOrderSchema).optional(),
			engine: z.lazy(() => SortOrderSchema).optional(),
			version: z.lazy(() => SortOrderSchema).optional(),
			command: z.lazy(() => SortOrderSchema).optional(),
			vsCodeLink: z.lazy(() => SortOrderSchema).optional(),
			codemodStudioExampleLink: z.lazy(() => SortOrderSchema).optional(),
			testProjectCommand: z.lazy(() => SortOrderSchema).optional(),
			sourceRepo: z.lazy(() => SortOrderSchema).optional(),
			amountOfUses: z.lazy(() => SortOrderSchema).optional(),
			totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
			openedPrs: z.lazy(() => SortOrderSchema).optional(),
			labels: z.lazy(() => SortOrderSchema).optional(),
			readmeLink: z.lazy(() => SortOrderSchema).optional(),
			indexTsLink: z.lazy(() => SortOrderSchema).optional(),
			framework: z
				.union([
					z.lazy(() => SortOrderSchema),
					z.lazy(() => SortOrderInputSchema),
				])
				.optional(),
			frameworkVersion: z
				.union([
					z.lazy(() => SortOrderSchema),
					z.lazy(() => SortOrderInputSchema),
				])
				.optional(),
			userStories: z
				.union([
					z.lazy(() => SortOrderSchema),
					z.lazy(() => SortOrderInputSchema),
				])
				.optional(),
			requirements: z
				.union([
					z.lazy(() => SortOrderSchema),
					z.lazy(() => SortOrderInputSchema),
				])
				.optional(),
			createdAt: z.lazy(() => SortOrderSchema).optional(),
			lastUpdate: z.lazy(() => SortOrderSchema).optional(),
		})
		.strict();

export const CodemodWhereUniqueInputSchema: z.ZodType<Prisma.CodemodWhereUniqueInput> =
	z
		.union([
			z.object({
				id: z.number().int(),
				slug: z.string(),
			}),
			z.object({
				id: z.number().int(),
			}),
			z.object({
				slug: z.string(),
			}),
		])
		.and(
			z
				.object({
					id: z.number().int().optional(),
					slug: z.string().optional(),
					AND: z
						.union([
							z.lazy(() => CodemodWhereInputSchema),
							z.lazy(() => CodemodWhereInputSchema).array(),
						])
						.optional(),
					OR: z
						.lazy(() => CodemodWhereInputSchema)
						.array()
						.optional(),
					NOT: z
						.union([
							z.lazy(() => CodemodWhereInputSchema),
							z.lazy(() => CodemodWhereInputSchema).array(),
						])
						.optional(),
					name: z
						.union([z.lazy(() => StringFilterSchema), z.string()])
						.optional(),
					shortDescription: z
						.union([z.lazy(() => StringFilterSchema), z.string()])
						.optional(),
					type: z
						.union([
							z.lazy(() => EnumCodemodTypeFilterSchema),
							z.lazy(() => CodemodTypeSchema),
						])
						.optional(),
					private: z
						.union([z.lazy(() => BoolFilterSchema), z.boolean()])
						.optional(),
					featured: z
						.union([z.lazy(() => BoolFilterSchema), z.boolean()])
						.optional(),
					verified: z
						.union([z.lazy(() => BoolFilterSchema), z.boolean()])
						.optional(),
					author: z
						.union([z.lazy(() => StringFilterSchema), z.string()])
						.optional(),
					engine: z
						.union([z.lazy(() => StringFilterSchema), z.string()])
						.optional(),
					version: z
						.union([z.lazy(() => StringFilterSchema), z.string()])
						.optional(),
					command: z
						.union([z.lazy(() => StringFilterSchema), z.string()])
						.optional(),
					vsCodeLink: z
						.union([z.lazy(() => StringFilterSchema), z.string()])
						.optional(),
					codemodStudioExampleLink: z
						.union([z.lazy(() => StringFilterSchema), z.string()])
						.optional(),
					testProjectCommand: z
						.union([z.lazy(() => StringFilterSchema), z.string()])
						.optional(),
					sourceRepo: z
						.union([z.lazy(() => StringFilterSchema), z.string()])
						.optional(),
					amountOfUses: z
						.union([z.lazy(() => IntFilterSchema), z.number().int()])
						.optional(),
					totalTimeSaved: z
						.union([z.lazy(() => IntFilterSchema), z.number().int()])
						.optional(),
					openedPrs: z
						.union([z.lazy(() => IntFilterSchema), z.number().int()])
						.optional(),
					labels: z.lazy(() => StringNullableListFilterSchema).optional(),
					readmeLink: z
						.union([z.lazy(() => StringFilterSchema), z.string()])
						.optional(),
					indexTsLink: z
						.union([z.lazy(() => StringFilterSchema), z.string()])
						.optional(),
					framework: z
						.union([z.lazy(() => StringNullableFilterSchema), z.string()])
						.optional()
						.nullable(),
					frameworkVersion: z
						.union([z.lazy(() => StringNullableFilterSchema), z.string()])
						.optional()
						.nullable(),
					userStories: z
						.union([z.lazy(() => StringNullableFilterSchema), z.string()])
						.optional()
						.nullable(),
					requirements: z
						.union([z.lazy(() => StringNullableFilterSchema), z.string()])
						.optional()
						.nullable(),
					createdAt: z
						.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()])
						.optional(),
					lastUpdate: z
						.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()])
						.optional(),
				})
				.strict(),
		);

export const CodemodOrderByWithAggregationInputSchema: z.ZodType<Prisma.CodemodOrderByWithAggregationInput> =
	z
		.object({
			id: z.lazy(() => SortOrderSchema).optional(),
			slug: z.lazy(() => SortOrderSchema).optional(),
			name: z.lazy(() => SortOrderSchema).optional(),
			shortDescription: z.lazy(() => SortOrderSchema).optional(),
			type: z.lazy(() => SortOrderSchema).optional(),
			private: z.lazy(() => SortOrderSchema).optional(),
			featured: z.lazy(() => SortOrderSchema).optional(),
			verified: z.lazy(() => SortOrderSchema).optional(),
			author: z.lazy(() => SortOrderSchema).optional(),
			engine: z.lazy(() => SortOrderSchema).optional(),
			version: z.lazy(() => SortOrderSchema).optional(),
			command: z.lazy(() => SortOrderSchema).optional(),
			vsCodeLink: z.lazy(() => SortOrderSchema).optional(),
			codemodStudioExampleLink: z.lazy(() => SortOrderSchema).optional(),
			testProjectCommand: z.lazy(() => SortOrderSchema).optional(),
			sourceRepo: z.lazy(() => SortOrderSchema).optional(),
			amountOfUses: z.lazy(() => SortOrderSchema).optional(),
			totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
			openedPrs: z.lazy(() => SortOrderSchema).optional(),
			labels: z.lazy(() => SortOrderSchema).optional(),
			readmeLink: z.lazy(() => SortOrderSchema).optional(),
			indexTsLink: z.lazy(() => SortOrderSchema).optional(),
			framework: z
				.union([
					z.lazy(() => SortOrderSchema),
					z.lazy(() => SortOrderInputSchema),
				])
				.optional(),
			frameworkVersion: z
				.union([
					z.lazy(() => SortOrderSchema),
					z.lazy(() => SortOrderInputSchema),
				])
				.optional(),
			userStories: z
				.union([
					z.lazy(() => SortOrderSchema),
					z.lazy(() => SortOrderInputSchema),
				])
				.optional(),
			requirements: z
				.union([
					z.lazy(() => SortOrderSchema),
					z.lazy(() => SortOrderInputSchema),
				])
				.optional(),
			createdAt: z.lazy(() => SortOrderSchema).optional(),
			lastUpdate: z.lazy(() => SortOrderSchema).optional(),
			_count: z.lazy(() => CodemodCountOrderByAggregateInputSchema).optional(),
			_avg: z.lazy(() => CodemodAvgOrderByAggregateInputSchema).optional(),
			_max: z.lazy(() => CodemodMaxOrderByAggregateInputSchema).optional(),
			_min: z.lazy(() => CodemodMinOrderByAggregateInputSchema).optional(),
			_sum: z.lazy(() => CodemodSumOrderByAggregateInputSchema).optional(),
		})
		.strict();

export const CodemodScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CodemodScalarWhereWithAggregatesInput> =
	z
		.object({
			AND: z
				.union([
					z.lazy(() => CodemodScalarWhereWithAggregatesInputSchema),
					z.lazy(() => CodemodScalarWhereWithAggregatesInputSchema).array(),
				])
				.optional(),
			OR: z
				.lazy(() => CodemodScalarWhereWithAggregatesInputSchema)
				.array()
				.optional(),
			NOT: z
				.union([
					z.lazy(() => CodemodScalarWhereWithAggregatesInputSchema),
					z.lazy(() => CodemodScalarWhereWithAggregatesInputSchema).array(),
				])
				.optional(),
			id: z
				.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()])
				.optional(),
			slug: z
				.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
				.optional(),
			name: z
				.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
				.optional(),
			shortDescription: z
				.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
				.optional(),
			type: z
				.union([
					z.lazy(() => EnumCodemodTypeWithAggregatesFilterSchema),
					z.lazy(() => CodemodTypeSchema),
				])
				.optional(),
			private: z
				.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()])
				.optional(),
			featured: z
				.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()])
				.optional(),
			verified: z
				.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()])
				.optional(),
			author: z
				.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
				.optional(),
			engine: z
				.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
				.optional(),
			version: z
				.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
				.optional(),
			command: z
				.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
				.optional(),
			vsCodeLink: z
				.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
				.optional(),
			codemodStudioExampleLink: z
				.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
				.optional(),
			testProjectCommand: z
				.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
				.optional(),
			sourceRepo: z
				.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
				.optional(),
			amountOfUses: z
				.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()])
				.optional(),
			totalTimeSaved: z
				.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()])
				.optional(),
			openedPrs: z
				.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()])
				.optional(),
			labels: z.lazy(() => StringNullableListFilterSchema).optional(),
			readmeLink: z
				.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
				.optional(),
			indexTsLink: z
				.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
				.optional(),
			framework: z
				.union([
					z.lazy(() => StringNullableWithAggregatesFilterSchema),
					z.string(),
				])
				.optional()
				.nullable(),
			frameworkVersion: z
				.union([
					z.lazy(() => StringNullableWithAggregatesFilterSchema),
					z.string(),
				])
				.optional()
				.nullable(),
			userStories: z
				.union([
					z.lazy(() => StringNullableWithAggregatesFilterSchema),
					z.string(),
				])
				.optional()
				.nullable(),
			requirements: z
				.union([
					z.lazy(() => StringNullableWithAggregatesFilterSchema),
					z.string(),
				])
				.optional()
				.nullable(),
			createdAt: z
				.union([
					z.lazy(() => DateTimeWithAggregatesFilterSchema),
					z.coerce.date(),
				])
				.optional(),
			lastUpdate: z
				.union([
					z.lazy(() => DateTimeWithAggregatesFilterSchema),
					z.coerce.date(),
				])
				.optional(),
		})
		.strict();

export const CodemodCreateInputSchema: z.ZodType<Prisma.CodemodCreateInput> = z
	.object({
		slug: z.string(),
		name: z.string(),
		shortDescription: z.string(),
		type: z.lazy(() => CodemodTypeSchema),
		private: z.boolean(),
		featured: z.boolean().optional(),
		verified: z.boolean(),
		author: z.string(),
		engine: z.string(),
		version: z.string(),
		command: z.string(),
		vsCodeLink: z.string(),
		codemodStudioExampleLink: z.string(),
		testProjectCommand: z.string(),
		sourceRepo: z.string(),
		amountOfUses: z.number().int().optional(),
		totalTimeSaved: z.number().int().optional(),
		openedPrs: z.number().int().optional(),
		labels: z
			.union([z.lazy(() => CodemodCreatelabelsInputSchema), z.string().array()])
			.optional(),
		readmeLink: z.string(),
		indexTsLink: z.string(),
		framework: z.string().optional().nullable(),
		frameworkVersion: z.string().optional().nullable(),
		userStories: z.string().optional().nullable(),
		requirements: z.string().optional().nullable(),
		createdAt: z.coerce.date().optional(),
		lastUpdate: z.coerce.date().optional(),
	})
	.strict();

export const CodemodUncheckedCreateInputSchema: z.ZodType<Prisma.CodemodUncheckedCreateInput> =
	z
		.object({
			id: z.number().int().optional(),
			slug: z.string(),
			name: z.string(),
			shortDescription: z.string(),
			type: z.lazy(() => CodemodTypeSchema),
			private: z.boolean(),
			featured: z.boolean().optional(),
			verified: z.boolean(),
			author: z.string(),
			engine: z.string(),
			version: z.string(),
			command: z.string(),
			vsCodeLink: z.string(),
			codemodStudioExampleLink: z.string(),
			testProjectCommand: z.string(),
			sourceRepo: z.string(),
			amountOfUses: z.number().int().optional(),
			totalTimeSaved: z.number().int().optional(),
			openedPrs: z.number().int().optional(),
			labels: z
				.union([
					z.lazy(() => CodemodCreatelabelsInputSchema),
					z.string().array(),
				])
				.optional(),
			readmeLink: z.string(),
			indexTsLink: z.string(),
			framework: z.string().optional().nullable(),
			frameworkVersion: z.string().optional().nullable(),
			userStories: z.string().optional().nullable(),
			requirements: z.string().optional().nullable(),
			createdAt: z.coerce.date().optional(),
			lastUpdate: z.coerce.date().optional(),
		})
		.strict();

export const CodemodUpdateInputSchema: z.ZodType<Prisma.CodemodUpdateInput> = z
	.object({
		slug: z
			.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
			.optional(),
		name: z
			.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
			.optional(),
		shortDescription: z
			.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
			.optional(),
		type: z
			.union([
				z.lazy(() => CodemodTypeSchema),
				z.lazy(() => EnumCodemodTypeFieldUpdateOperationsInputSchema),
			])
			.optional(),
		private: z
			.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
			.optional(),
		featured: z
			.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
			.optional(),
		verified: z
			.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
			.optional(),
		author: z
			.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
			.optional(),
		engine: z
			.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
			.optional(),
		version: z
			.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
			.optional(),
		command: z
			.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
			.optional(),
		vsCodeLink: z
			.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
			.optional(),
		codemodStudioExampleLink: z
			.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
			.optional(),
		testProjectCommand: z
			.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
			.optional(),
		sourceRepo: z
			.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
			.optional(),
		amountOfUses: z
			.union([
				z.number().int(),
				z.lazy(() => IntFieldUpdateOperationsInputSchema),
			])
			.optional(),
		totalTimeSaved: z
			.union([
				z.number().int(),
				z.lazy(() => IntFieldUpdateOperationsInputSchema),
			])
			.optional(),
		openedPrs: z
			.union([
				z.number().int(),
				z.lazy(() => IntFieldUpdateOperationsInputSchema),
			])
			.optional(),
		labels: z
			.union([z.lazy(() => CodemodUpdatelabelsInputSchema), z.string().array()])
			.optional(),
		readmeLink: z
			.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
			.optional(),
		indexTsLink: z
			.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
			.optional(),
		framework: z
			.union([
				z.string(),
				z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
			])
			.optional()
			.nullable(),
		frameworkVersion: z
			.union([
				z.string(),
				z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
			])
			.optional()
			.nullable(),
		userStories: z
			.union([
				z.string(),
				z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
			])
			.optional()
			.nullable(),
		requirements: z
			.union([
				z.string(),
				z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
			])
			.optional()
			.nullable(),
		createdAt: z
			.union([
				z.coerce.date(),
				z.lazy(() => DateTimeFieldUpdateOperationsInputSchema),
			])
			.optional(),
		lastUpdate: z
			.union([
				z.coerce.date(),
				z.lazy(() => DateTimeFieldUpdateOperationsInputSchema),
			])
			.optional(),
	})
	.strict();

export const CodemodUncheckedUpdateInputSchema: z.ZodType<Prisma.CodemodUncheckedUpdateInput> =
	z
		.object({
			id: z
				.union([
					z.number().int(),
					z.lazy(() => IntFieldUpdateOperationsInputSchema),
				])
				.optional(),
			slug: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			name: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			shortDescription: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			type: z
				.union([
					z.lazy(() => CodemodTypeSchema),
					z.lazy(() => EnumCodemodTypeFieldUpdateOperationsInputSchema),
				])
				.optional(),
			private: z
				.union([
					z.boolean(),
					z.lazy(() => BoolFieldUpdateOperationsInputSchema),
				])
				.optional(),
			featured: z
				.union([
					z.boolean(),
					z.lazy(() => BoolFieldUpdateOperationsInputSchema),
				])
				.optional(),
			verified: z
				.union([
					z.boolean(),
					z.lazy(() => BoolFieldUpdateOperationsInputSchema),
				])
				.optional(),
			author: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			engine: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			version: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			command: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			vsCodeLink: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			codemodStudioExampleLink: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			testProjectCommand: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			sourceRepo: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			amountOfUses: z
				.union([
					z.number().int(),
					z.lazy(() => IntFieldUpdateOperationsInputSchema),
				])
				.optional(),
			totalTimeSaved: z
				.union([
					z.number().int(),
					z.lazy(() => IntFieldUpdateOperationsInputSchema),
				])
				.optional(),
			openedPrs: z
				.union([
					z.number().int(),
					z.lazy(() => IntFieldUpdateOperationsInputSchema),
				])
				.optional(),
			labels: z
				.union([
					z.lazy(() => CodemodUpdatelabelsInputSchema),
					z.string().array(),
				])
				.optional(),
			readmeLink: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			indexTsLink: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			framework: z
				.union([
					z.string(),
					z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
				])
				.optional()
				.nullable(),
			frameworkVersion: z
				.union([
					z.string(),
					z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
				])
				.optional()
				.nullable(),
			userStories: z
				.union([
					z.string(),
					z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
				])
				.optional()
				.nullable(),
			requirements: z
				.union([
					z.string(),
					z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
				])
				.optional()
				.nullable(),
			createdAt: z
				.union([
					z.coerce.date(),
					z.lazy(() => DateTimeFieldUpdateOperationsInputSchema),
				])
				.optional(),
			lastUpdate: z
				.union([
					z.coerce.date(),
					z.lazy(() => DateTimeFieldUpdateOperationsInputSchema),
				])
				.optional(),
		})
		.strict();

export const CodemodCreateManyInputSchema: z.ZodType<Prisma.CodemodCreateManyInput> =
	z
		.object({
			id: z.number().int().optional(),
			slug: z.string(),
			name: z.string(),
			shortDescription: z.string(),
			type: z.lazy(() => CodemodTypeSchema),
			private: z.boolean(),
			featured: z.boolean().optional(),
			verified: z.boolean(),
			author: z.string(),
			engine: z.string(),
			version: z.string(),
			command: z.string(),
			vsCodeLink: z.string(),
			codemodStudioExampleLink: z.string(),
			testProjectCommand: z.string(),
			sourceRepo: z.string(),
			amountOfUses: z.number().int().optional(),
			totalTimeSaved: z.number().int().optional(),
			openedPrs: z.number().int().optional(),
			labels: z
				.union([
					z.lazy(() => CodemodCreatelabelsInputSchema),
					z.string().array(),
				])
				.optional(),
			readmeLink: z.string(),
			indexTsLink: z.string(),
			framework: z.string().optional().nullable(),
			frameworkVersion: z.string().optional().nullable(),
			userStories: z.string().optional().nullable(),
			requirements: z.string().optional().nullable(),
			createdAt: z.coerce.date().optional(),
			lastUpdate: z.coerce.date().optional(),
		})
		.strict();

export const CodemodUpdateManyMutationInputSchema: z.ZodType<Prisma.CodemodUpdateManyMutationInput> =
	z
		.object({
			slug: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			name: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			shortDescription: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			type: z
				.union([
					z.lazy(() => CodemodTypeSchema),
					z.lazy(() => EnumCodemodTypeFieldUpdateOperationsInputSchema),
				])
				.optional(),
			private: z
				.union([
					z.boolean(),
					z.lazy(() => BoolFieldUpdateOperationsInputSchema),
				])
				.optional(),
			featured: z
				.union([
					z.boolean(),
					z.lazy(() => BoolFieldUpdateOperationsInputSchema),
				])
				.optional(),
			verified: z
				.union([
					z.boolean(),
					z.lazy(() => BoolFieldUpdateOperationsInputSchema),
				])
				.optional(),
			author: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			engine: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			version: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			command: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			vsCodeLink: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			codemodStudioExampleLink: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			testProjectCommand: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			sourceRepo: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			amountOfUses: z
				.union([
					z.number().int(),
					z.lazy(() => IntFieldUpdateOperationsInputSchema),
				])
				.optional(),
			totalTimeSaved: z
				.union([
					z.number().int(),
					z.lazy(() => IntFieldUpdateOperationsInputSchema),
				])
				.optional(),
			openedPrs: z
				.union([
					z.number().int(),
					z.lazy(() => IntFieldUpdateOperationsInputSchema),
				])
				.optional(),
			labels: z
				.union([
					z.lazy(() => CodemodUpdatelabelsInputSchema),
					z.string().array(),
				])
				.optional(),
			readmeLink: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			indexTsLink: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			framework: z
				.union([
					z.string(),
					z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
				])
				.optional()
				.nullable(),
			frameworkVersion: z
				.union([
					z.string(),
					z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
				])
				.optional()
				.nullable(),
			userStories: z
				.union([
					z.string(),
					z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
				])
				.optional()
				.nullable(),
			requirements: z
				.union([
					z.string(),
					z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
				])
				.optional()
				.nullable(),
			createdAt: z
				.union([
					z.coerce.date(),
					z.lazy(() => DateTimeFieldUpdateOperationsInputSchema),
				])
				.optional(),
			lastUpdate: z
				.union([
					z.coerce.date(),
					z.lazy(() => DateTimeFieldUpdateOperationsInputSchema),
				])
				.optional(),
		})
		.strict();

export const CodemodUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CodemodUncheckedUpdateManyInput> =
	z
		.object({
			id: z
				.union([
					z.number().int(),
					z.lazy(() => IntFieldUpdateOperationsInputSchema),
				])
				.optional(),
			slug: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			name: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			shortDescription: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			type: z
				.union([
					z.lazy(() => CodemodTypeSchema),
					z.lazy(() => EnumCodemodTypeFieldUpdateOperationsInputSchema),
				])
				.optional(),
			private: z
				.union([
					z.boolean(),
					z.lazy(() => BoolFieldUpdateOperationsInputSchema),
				])
				.optional(),
			featured: z
				.union([
					z.boolean(),
					z.lazy(() => BoolFieldUpdateOperationsInputSchema),
				])
				.optional(),
			verified: z
				.union([
					z.boolean(),
					z.lazy(() => BoolFieldUpdateOperationsInputSchema),
				])
				.optional(),
			author: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			engine: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			version: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			command: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			vsCodeLink: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			codemodStudioExampleLink: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			testProjectCommand: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			sourceRepo: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			amountOfUses: z
				.union([
					z.number().int(),
					z.lazy(() => IntFieldUpdateOperationsInputSchema),
				])
				.optional(),
			totalTimeSaved: z
				.union([
					z.number().int(),
					z.lazy(() => IntFieldUpdateOperationsInputSchema),
				])
				.optional(),
			openedPrs: z
				.union([
					z.number().int(),
					z.lazy(() => IntFieldUpdateOperationsInputSchema),
				])
				.optional(),
			labels: z
				.union([
					z.lazy(() => CodemodUpdatelabelsInputSchema),
					z.string().array(),
				])
				.optional(),
			readmeLink: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			indexTsLink: z
				.union([
					z.string(),
					z.lazy(() => StringFieldUpdateOperationsInputSchema),
				])
				.optional(),
			framework: z
				.union([
					z.string(),
					z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
				])
				.optional()
				.nullable(),
			frameworkVersion: z
				.union([
					z.string(),
					z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
				])
				.optional()
				.nullable(),
			userStories: z
				.union([
					z.string(),
					z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
				])
				.optional()
				.nullable(),
			requirements: z
				.union([
					z.string(),
					z.lazy(() => NullableStringFieldUpdateOperationsInputSchema),
				])
				.optional()
				.nullable(),
			createdAt: z
				.union([
					z.coerce.date(),
					z.lazy(() => DateTimeFieldUpdateOperationsInputSchema),
				])
				.optional(),
			lastUpdate: z
				.union([
					z.coerce.date(),
					z.lazy(() => DateTimeFieldUpdateOperationsInputSchema),
				])
				.optional(),
		})
		.strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z
	.object({
		equals: z.number().optional(),
		in: z.number().array().optional(),
		notIn: z.number().array().optional(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z.union([z.number(), z.lazy(() => NestedIntFilterSchema)]).optional(),
	})
	.strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z
	.object({
		equals: z.string().optional(),
		in: z.string().array().optional(),
		notIn: z.string().array().optional(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		mode: z.lazy(() => QueryModeSchema).optional(),
		not: z
			.union([z.string(), z.lazy(() => NestedStringFilterSchema)])
			.optional(),
	})
	.strict();

export const EnumCodemodTypeFilterSchema: z.ZodType<Prisma.EnumCodemodTypeFilter> =
	z
		.object({
			equals: z.lazy(() => CodemodTypeSchema).optional(),
			in: z
				.lazy(() => CodemodTypeSchema)
				.array()
				.optional(),
			notIn: z
				.lazy(() => CodemodTypeSchema)
				.array()
				.optional(),
			not: z
				.union([
					z.lazy(() => CodemodTypeSchema),
					z.lazy(() => NestedEnumCodemodTypeFilterSchema),
				])
				.optional(),
		})
		.strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z
	.object({
		equals: z.boolean().optional(),
		not: z
			.union([z.boolean(), z.lazy(() => NestedBoolFilterSchema)])
			.optional(),
	})
	.strict();

export const StringNullableListFilterSchema: z.ZodType<Prisma.StringNullableListFilter> =
	z
		.object({
			equals: z.string().array().optional().nullable(),
			has: z.string().optional().nullable(),
			hasEvery: z.string().array().optional(),
			hasSome: z.string().array().optional(),
			isEmpty: z.boolean().optional(),
		})
		.strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> =
	z
		.object({
			equals: z.string().optional().nullable(),
			in: z.string().array().optional().nullable(),
			notIn: z.string().array().optional().nullable(),
			lt: z.string().optional(),
			lte: z.string().optional(),
			gt: z.string().optional(),
			gte: z.string().optional(),
			contains: z.string().optional(),
			startsWith: z.string().optional(),
			endsWith: z.string().optional(),
			mode: z.lazy(() => QueryModeSchema).optional(),
			not: z
				.union([z.string(), z.lazy(() => NestedStringNullableFilterSchema)])
				.optional()
				.nullable(),
		})
		.strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z
	.object({
		equals: z.coerce.date().optional(),
		in: z.coerce.date().array().optional(),
		notIn: z.coerce.date().array().optional(),
		lt: z.coerce.date().optional(),
		lte: z.coerce.date().optional(),
		gt: z.coerce.date().optional(),
		gte: z.coerce.date().optional(),
		not: z
			.union([z.coerce.date(), z.lazy(() => NestedDateTimeFilterSchema)])
			.optional(),
	})
	.strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z
	.object({
		sort: z.lazy(() => SortOrderSchema),
		nulls: z.lazy(() => NullsOrderSchema).optional(),
	})
	.strict();

export const CodemodCountOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodCountOrderByAggregateInput> =
	z
		.object({
			id: z.lazy(() => SortOrderSchema).optional(),
			slug: z.lazy(() => SortOrderSchema).optional(),
			name: z.lazy(() => SortOrderSchema).optional(),
			shortDescription: z.lazy(() => SortOrderSchema).optional(),
			type: z.lazy(() => SortOrderSchema).optional(),
			private: z.lazy(() => SortOrderSchema).optional(),
			featured: z.lazy(() => SortOrderSchema).optional(),
			verified: z.lazy(() => SortOrderSchema).optional(),
			author: z.lazy(() => SortOrderSchema).optional(),
			engine: z.lazy(() => SortOrderSchema).optional(),
			version: z.lazy(() => SortOrderSchema).optional(),
			command: z.lazy(() => SortOrderSchema).optional(),
			vsCodeLink: z.lazy(() => SortOrderSchema).optional(),
			codemodStudioExampleLink: z.lazy(() => SortOrderSchema).optional(),
			testProjectCommand: z.lazy(() => SortOrderSchema).optional(),
			sourceRepo: z.lazy(() => SortOrderSchema).optional(),
			amountOfUses: z.lazy(() => SortOrderSchema).optional(),
			totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
			openedPrs: z.lazy(() => SortOrderSchema).optional(),
			labels: z.lazy(() => SortOrderSchema).optional(),
			readmeLink: z.lazy(() => SortOrderSchema).optional(),
			indexTsLink: z.lazy(() => SortOrderSchema).optional(),
			framework: z.lazy(() => SortOrderSchema).optional(),
			frameworkVersion: z.lazy(() => SortOrderSchema).optional(),
			userStories: z.lazy(() => SortOrderSchema).optional(),
			requirements: z.lazy(() => SortOrderSchema).optional(),
			createdAt: z.lazy(() => SortOrderSchema).optional(),
			lastUpdate: z.lazy(() => SortOrderSchema).optional(),
		})
		.strict();

export const CodemodAvgOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodAvgOrderByAggregateInput> =
	z
		.object({
			id: z.lazy(() => SortOrderSchema).optional(),
			amountOfUses: z.lazy(() => SortOrderSchema).optional(),
			totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
			openedPrs: z.lazy(() => SortOrderSchema).optional(),
		})
		.strict();

export const CodemodMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodMaxOrderByAggregateInput> =
	z
		.object({
			id: z.lazy(() => SortOrderSchema).optional(),
			slug: z.lazy(() => SortOrderSchema).optional(),
			name: z.lazy(() => SortOrderSchema).optional(),
			shortDescription: z.lazy(() => SortOrderSchema).optional(),
			type: z.lazy(() => SortOrderSchema).optional(),
			private: z.lazy(() => SortOrderSchema).optional(),
			featured: z.lazy(() => SortOrderSchema).optional(),
			verified: z.lazy(() => SortOrderSchema).optional(),
			author: z.lazy(() => SortOrderSchema).optional(),
			engine: z.lazy(() => SortOrderSchema).optional(),
			version: z.lazy(() => SortOrderSchema).optional(),
			command: z.lazy(() => SortOrderSchema).optional(),
			vsCodeLink: z.lazy(() => SortOrderSchema).optional(),
			codemodStudioExampleLink: z.lazy(() => SortOrderSchema).optional(),
			testProjectCommand: z.lazy(() => SortOrderSchema).optional(),
			sourceRepo: z.lazy(() => SortOrderSchema).optional(),
			amountOfUses: z.lazy(() => SortOrderSchema).optional(),
			totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
			openedPrs: z.lazy(() => SortOrderSchema).optional(),
			readmeLink: z.lazy(() => SortOrderSchema).optional(),
			indexTsLink: z.lazy(() => SortOrderSchema).optional(),
			framework: z.lazy(() => SortOrderSchema).optional(),
			frameworkVersion: z.lazy(() => SortOrderSchema).optional(),
			userStories: z.lazy(() => SortOrderSchema).optional(),
			requirements: z.lazy(() => SortOrderSchema).optional(),
			createdAt: z.lazy(() => SortOrderSchema).optional(),
			lastUpdate: z.lazy(() => SortOrderSchema).optional(),
		})
		.strict();

export const CodemodMinOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodMinOrderByAggregateInput> =
	z
		.object({
			id: z.lazy(() => SortOrderSchema).optional(),
			slug: z.lazy(() => SortOrderSchema).optional(),
			name: z.lazy(() => SortOrderSchema).optional(),
			shortDescription: z.lazy(() => SortOrderSchema).optional(),
			type: z.lazy(() => SortOrderSchema).optional(),
			private: z.lazy(() => SortOrderSchema).optional(),
			featured: z.lazy(() => SortOrderSchema).optional(),
			verified: z.lazy(() => SortOrderSchema).optional(),
			author: z.lazy(() => SortOrderSchema).optional(),
			engine: z.lazy(() => SortOrderSchema).optional(),
			version: z.lazy(() => SortOrderSchema).optional(),
			command: z.lazy(() => SortOrderSchema).optional(),
			vsCodeLink: z.lazy(() => SortOrderSchema).optional(),
			codemodStudioExampleLink: z.lazy(() => SortOrderSchema).optional(),
			testProjectCommand: z.lazy(() => SortOrderSchema).optional(),
			sourceRepo: z.lazy(() => SortOrderSchema).optional(),
			amountOfUses: z.lazy(() => SortOrderSchema).optional(),
			totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
			openedPrs: z.lazy(() => SortOrderSchema).optional(),
			readmeLink: z.lazy(() => SortOrderSchema).optional(),
			indexTsLink: z.lazy(() => SortOrderSchema).optional(),
			framework: z.lazy(() => SortOrderSchema).optional(),
			frameworkVersion: z.lazy(() => SortOrderSchema).optional(),
			userStories: z.lazy(() => SortOrderSchema).optional(),
			requirements: z.lazy(() => SortOrderSchema).optional(),
			createdAt: z.lazy(() => SortOrderSchema).optional(),
			lastUpdate: z.lazy(() => SortOrderSchema).optional(),
		})
		.strict();

export const CodemodSumOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodSumOrderByAggregateInput> =
	z
		.object({
			id: z.lazy(() => SortOrderSchema).optional(),
			amountOfUses: z.lazy(() => SortOrderSchema).optional(),
			totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
			openedPrs: z.lazy(() => SortOrderSchema).optional(),
		})
		.strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> =
	z
		.object({
			equals: z.number().optional(),
			in: z.number().array().optional(),
			notIn: z.number().array().optional(),
			lt: z.number().optional(),
			lte: z.number().optional(),
			gt: z.number().optional(),
			gte: z.number().optional(),
			not: z
				.union([z.number(), z.lazy(() => NestedIntWithAggregatesFilterSchema)])
				.optional(),
			_count: z.lazy(() => NestedIntFilterSchema).optional(),
			_avg: z.lazy(() => NestedFloatFilterSchema).optional(),
			_sum: z.lazy(() => NestedIntFilterSchema).optional(),
			_min: z.lazy(() => NestedIntFilterSchema).optional(),
			_max: z.lazy(() => NestedIntFilterSchema).optional(),
		})
		.strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> =
	z
		.object({
			equals: z.string().optional(),
			in: z.string().array().optional(),
			notIn: z.string().array().optional(),
			lt: z.string().optional(),
			lte: z.string().optional(),
			gt: z.string().optional(),
			gte: z.string().optional(),
			contains: z.string().optional(),
			startsWith: z.string().optional(),
			endsWith: z.string().optional(),
			mode: z.lazy(() => QueryModeSchema).optional(),
			not: z
				.union([
					z.string(),
					z.lazy(() => NestedStringWithAggregatesFilterSchema),
				])
				.optional(),
			_count: z.lazy(() => NestedIntFilterSchema).optional(),
			_min: z.lazy(() => NestedStringFilterSchema).optional(),
			_max: z.lazy(() => NestedStringFilterSchema).optional(),
		})
		.strict();

export const EnumCodemodTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumCodemodTypeWithAggregatesFilter> =
	z
		.object({
			equals: z.lazy(() => CodemodTypeSchema).optional(),
			in: z
				.lazy(() => CodemodTypeSchema)
				.array()
				.optional(),
			notIn: z
				.lazy(() => CodemodTypeSchema)
				.array()
				.optional(),
			not: z
				.union([
					z.lazy(() => CodemodTypeSchema),
					z.lazy(() => NestedEnumCodemodTypeWithAggregatesFilterSchema),
				])
				.optional(),
			_count: z.lazy(() => NestedIntFilterSchema).optional(),
			_min: z.lazy(() => NestedEnumCodemodTypeFilterSchema).optional(),
			_max: z.lazy(() => NestedEnumCodemodTypeFilterSchema).optional(),
		})
		.strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> =
	z
		.object({
			equals: z.boolean().optional(),
			not: z
				.union([
					z.boolean(),
					z.lazy(() => NestedBoolWithAggregatesFilterSchema),
				])
				.optional(),
			_count: z.lazy(() => NestedIntFilterSchema).optional(),
			_min: z.lazy(() => NestedBoolFilterSchema).optional(),
			_max: z.lazy(() => NestedBoolFilterSchema).optional(),
		})
		.strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> =
	z
		.object({
			equals: z.string().optional().nullable(),
			in: z.string().array().optional().nullable(),
			notIn: z.string().array().optional().nullable(),
			lt: z.string().optional(),
			lte: z.string().optional(),
			gt: z.string().optional(),
			gte: z.string().optional(),
			contains: z.string().optional(),
			startsWith: z.string().optional(),
			endsWith: z.string().optional(),
			mode: z.lazy(() => QueryModeSchema).optional(),
			not: z
				.union([
					z.string(),
					z.lazy(() => NestedStringNullableWithAggregatesFilterSchema),
				])
				.optional()
				.nullable(),
			_count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
			_min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
			_max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
		})
		.strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> =
	z
		.object({
			equals: z.coerce.date().optional(),
			in: z.coerce.date().array().optional(),
			notIn: z.coerce.date().array().optional(),
			lt: z.coerce.date().optional(),
			lte: z.coerce.date().optional(),
			gt: z.coerce.date().optional(),
			gte: z.coerce.date().optional(),
			not: z
				.union([
					z.coerce.date(),
					z.lazy(() => NestedDateTimeWithAggregatesFilterSchema),
				])
				.optional(),
			_count: z.lazy(() => NestedIntFilterSchema).optional(),
			_min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
			_max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
		})
		.strict();

export const CodemodCreatelabelsInputSchema: z.ZodType<Prisma.CodemodCreatelabelsInput> =
	z
		.object({
			set: z.string().array(),
		})
		.strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> =
	z
		.object({
			set: z.string().optional(),
		})
		.strict();

export const EnumCodemodTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumCodemodTypeFieldUpdateOperationsInput> =
	z
		.object({
			set: z.lazy(() => CodemodTypeSchema).optional(),
		})
		.strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> =
	z
		.object({
			set: z.boolean().optional(),
		})
		.strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> =
	z
		.object({
			set: z.number().optional(),
			increment: z.number().optional(),
			decrement: z.number().optional(),
			multiply: z.number().optional(),
			divide: z.number().optional(),
		})
		.strict();

export const CodemodUpdatelabelsInputSchema: z.ZodType<Prisma.CodemodUpdatelabelsInput> =
	z
		.object({
			set: z.string().array().optional(),
			push: z.union([z.string(), z.string().array()]).optional(),
		})
		.strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> =
	z
		.object({
			set: z.string().optional().nullable(),
		})
		.strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> =
	z
		.object({
			set: z.coerce.date().optional(),
		})
		.strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z
	.object({
		equals: z.number().optional(),
		in: z.number().array().optional(),
		notIn: z.number().array().optional(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z.union([z.number(), z.lazy(() => NestedIntFilterSchema)]).optional(),
	})
	.strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z
	.object({
		equals: z.string().optional(),
		in: z.string().array().optional(),
		notIn: z.string().array().optional(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		not: z
			.union([z.string(), z.lazy(() => NestedStringFilterSchema)])
			.optional(),
	})
	.strict();

export const NestedEnumCodemodTypeFilterSchema: z.ZodType<Prisma.NestedEnumCodemodTypeFilter> =
	z
		.object({
			equals: z.lazy(() => CodemodTypeSchema).optional(),
			in: z
				.lazy(() => CodemodTypeSchema)
				.array()
				.optional(),
			notIn: z
				.lazy(() => CodemodTypeSchema)
				.array()
				.optional(),
			not: z
				.union([
					z.lazy(() => CodemodTypeSchema),
					z.lazy(() => NestedEnumCodemodTypeFilterSchema),
				])
				.optional(),
		})
		.strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z
	.object({
		equals: z.boolean().optional(),
		not: z
			.union([z.boolean(), z.lazy(() => NestedBoolFilterSchema)])
			.optional(),
	})
	.strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> =
	z
		.object({
			equals: z.string().optional().nullable(),
			in: z.string().array().optional().nullable(),
			notIn: z.string().array().optional().nullable(),
			lt: z.string().optional(),
			lte: z.string().optional(),
			gt: z.string().optional(),
			gte: z.string().optional(),
			contains: z.string().optional(),
			startsWith: z.string().optional(),
			endsWith: z.string().optional(),
			not: z
				.union([z.string(), z.lazy(() => NestedStringNullableFilterSchema)])
				.optional()
				.nullable(),
		})
		.strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> =
	z
		.object({
			equals: z.coerce.date().optional(),
			in: z.coerce.date().array().optional(),
			notIn: z.coerce.date().array().optional(),
			lt: z.coerce.date().optional(),
			lte: z.coerce.date().optional(),
			gt: z.coerce.date().optional(),
			gte: z.coerce.date().optional(),
			not: z
				.union([z.coerce.date(), z.lazy(() => NestedDateTimeFilterSchema)])
				.optional(),
		})
		.strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> =
	z
		.object({
			equals: z.number().optional(),
			in: z.number().array().optional(),
			notIn: z.number().array().optional(),
			lt: z.number().optional(),
			lte: z.number().optional(),
			gt: z.number().optional(),
			gte: z.number().optional(),
			not: z
				.union([z.number(), z.lazy(() => NestedIntWithAggregatesFilterSchema)])
				.optional(),
			_count: z.lazy(() => NestedIntFilterSchema).optional(),
			_avg: z.lazy(() => NestedFloatFilterSchema).optional(),
			_sum: z.lazy(() => NestedIntFilterSchema).optional(),
			_min: z.lazy(() => NestedIntFilterSchema).optional(),
			_max: z.lazy(() => NestedIntFilterSchema).optional(),
		})
		.strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z
	.object({
		equals: z.number().optional(),
		in: z.number().array().optional(),
		notIn: z.number().array().optional(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z
			.union([z.number(), z.lazy(() => NestedFloatFilterSchema)])
			.optional(),
	})
	.strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> =
	z
		.object({
			equals: z.string().optional(),
			in: z.string().array().optional(),
			notIn: z.string().array().optional(),
			lt: z.string().optional(),
			lte: z.string().optional(),
			gt: z.string().optional(),
			gte: z.string().optional(),
			contains: z.string().optional(),
			startsWith: z.string().optional(),
			endsWith: z.string().optional(),
			not: z
				.union([
					z.string(),
					z.lazy(() => NestedStringWithAggregatesFilterSchema),
				])
				.optional(),
			_count: z.lazy(() => NestedIntFilterSchema).optional(),
			_min: z.lazy(() => NestedStringFilterSchema).optional(),
			_max: z.lazy(() => NestedStringFilterSchema).optional(),
		})
		.strict();

export const NestedEnumCodemodTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumCodemodTypeWithAggregatesFilter> =
	z
		.object({
			equals: z.lazy(() => CodemodTypeSchema).optional(),
			in: z
				.lazy(() => CodemodTypeSchema)
				.array()
				.optional(),
			notIn: z
				.lazy(() => CodemodTypeSchema)
				.array()
				.optional(),
			not: z
				.union([
					z.lazy(() => CodemodTypeSchema),
					z.lazy(() => NestedEnumCodemodTypeWithAggregatesFilterSchema),
				])
				.optional(),
			_count: z.lazy(() => NestedIntFilterSchema).optional(),
			_min: z.lazy(() => NestedEnumCodemodTypeFilterSchema).optional(),
			_max: z.lazy(() => NestedEnumCodemodTypeFilterSchema).optional(),
		})
		.strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> =
	z
		.object({
			equals: z.boolean().optional(),
			not: z
				.union([
					z.boolean(),
					z.lazy(() => NestedBoolWithAggregatesFilterSchema),
				])
				.optional(),
			_count: z.lazy(() => NestedIntFilterSchema).optional(),
			_min: z.lazy(() => NestedBoolFilterSchema).optional(),
			_max: z.lazy(() => NestedBoolFilterSchema).optional(),
		})
		.strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> =
	z
		.object({
			equals: z.string().optional().nullable(),
			in: z.string().array().optional().nullable(),
			notIn: z.string().array().optional().nullable(),
			lt: z.string().optional(),
			lte: z.string().optional(),
			gt: z.string().optional(),
			gte: z.string().optional(),
			contains: z.string().optional(),
			startsWith: z.string().optional(),
			endsWith: z.string().optional(),
			not: z
				.union([
					z.string(),
					z.lazy(() => NestedStringNullableWithAggregatesFilterSchema),
				])
				.optional()
				.nullable(),
			_count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
			_min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
			_max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
		})
		.strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> =
	z
		.object({
			equals: z.number().optional().nullable(),
			in: z.number().array().optional().nullable(),
			notIn: z.number().array().optional().nullable(),
			lt: z.number().optional(),
			lte: z.number().optional(),
			gt: z.number().optional(),
			gte: z.number().optional(),
			not: z
				.union([z.number(), z.lazy(() => NestedIntNullableFilterSchema)])
				.optional()
				.nullable(),
		})
		.strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> =
	z
		.object({
			equals: z.coerce.date().optional(),
			in: z.coerce.date().array().optional(),
			notIn: z.coerce.date().array().optional(),
			lt: z.coerce.date().optional(),
			lte: z.coerce.date().optional(),
			gt: z.coerce.date().optional(),
			gte: z.coerce.date().optional(),
			not: z
				.union([
					z.coerce.date(),
					z.lazy(() => NestedDateTimeWithAggregatesFilterSchema),
				])
				.optional(),
			_count: z.lazy(() => NestedIntFilterSchema).optional(),
			_min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
			_max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
		})
		.strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const CodemodFindFirstArgsSchema: z.ZodType<Prisma.CodemodFindFirstArgs> =
	z
		.object({
			select: CodemodSelectSchema.optional(),
			where: CodemodWhereInputSchema.optional(),
			orderBy: z
				.union([
					CodemodOrderByWithRelationInputSchema.array(),
					CodemodOrderByWithRelationInputSchema,
				])
				.optional(),
			cursor: CodemodWhereUniqueInputSchema.optional(),
			take: z.number().optional(),
			skip: z.number().optional(),
			distinct: z
				.union([
					CodemodScalarFieldEnumSchema,
					CodemodScalarFieldEnumSchema.array(),
				])
				.optional(),
		})
		.strict();

export const CodemodFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CodemodFindFirstOrThrowArgs> =
	z
		.object({
			select: CodemodSelectSchema.optional(),
			where: CodemodWhereInputSchema.optional(),
			orderBy: z
				.union([
					CodemodOrderByWithRelationInputSchema.array(),
					CodemodOrderByWithRelationInputSchema,
				])
				.optional(),
			cursor: CodemodWhereUniqueInputSchema.optional(),
			take: z.number().optional(),
			skip: z.number().optional(),
			distinct: z
				.union([
					CodemodScalarFieldEnumSchema,
					CodemodScalarFieldEnumSchema.array(),
				])
				.optional(),
		})
		.strict();

export const CodemodFindManyArgsSchema: z.ZodType<Prisma.CodemodFindManyArgs> =
	z
		.object({
			select: CodemodSelectSchema.optional(),
			where: CodemodWhereInputSchema.optional(),
			orderBy: z
				.union([
					CodemodOrderByWithRelationInputSchema.array(),
					CodemodOrderByWithRelationInputSchema,
				])
				.optional(),
			cursor: CodemodWhereUniqueInputSchema.optional(),
			take: z.number().optional(),
			skip: z.number().optional(),
			distinct: z
				.union([
					CodemodScalarFieldEnumSchema,
					CodemodScalarFieldEnumSchema.array(),
				])
				.optional(),
		})
		.strict();

export const CodemodAggregateArgsSchema: z.ZodType<Prisma.CodemodAggregateArgs> =
	z
		.object({
			where: CodemodWhereInputSchema.optional(),
			orderBy: z
				.union([
					CodemodOrderByWithRelationInputSchema.array(),
					CodemodOrderByWithRelationInputSchema,
				])
				.optional(),
			cursor: CodemodWhereUniqueInputSchema.optional(),
			take: z.number().optional(),
			skip: z.number().optional(),
		})
		.strict();

export const CodemodGroupByArgsSchema: z.ZodType<Prisma.CodemodGroupByArgs> = z
	.object({
		where: CodemodWhereInputSchema.optional(),
		orderBy: z
			.union([
				CodemodOrderByWithAggregationInputSchema.array(),
				CodemodOrderByWithAggregationInputSchema,
			])
			.optional(),
		by: CodemodScalarFieldEnumSchema.array(),
		having: CodemodScalarWhereWithAggregatesInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const CodemodFindUniqueArgsSchema: z.ZodType<Prisma.CodemodFindUniqueArgs> =
	z
		.object({
			select: CodemodSelectSchema.optional(),
			where: CodemodWhereUniqueInputSchema,
		})
		.strict();

export const CodemodFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CodemodFindUniqueOrThrowArgs> =
	z
		.object({
			select: CodemodSelectSchema.optional(),
			where: CodemodWhereUniqueInputSchema,
		})
		.strict();

export const CodemodCreateArgsSchema: z.ZodType<Prisma.CodemodCreateArgs> = z
	.object({
		select: CodemodSelectSchema.optional(),
		data: z.union([
			CodemodCreateInputSchema,
			CodemodUncheckedCreateInputSchema,
		]),
	})
	.strict();

export const CodemodUpsertArgsSchema: z.ZodType<Prisma.CodemodUpsertArgs> = z
	.object({
		select: CodemodSelectSchema.optional(),
		where: CodemodWhereUniqueInputSchema,
		create: z.union([
			CodemodCreateInputSchema,
			CodemodUncheckedCreateInputSchema,
		]),
		update: z.union([
			CodemodUpdateInputSchema,
			CodemodUncheckedUpdateInputSchema,
		]),
	})
	.strict();

export const CodemodCreateManyArgsSchema: z.ZodType<Prisma.CodemodCreateManyArgs> =
	z
		.object({
			data: z.union([
				CodemodCreateManyInputSchema,
				CodemodCreateManyInputSchema.array(),
			]),
			skipDuplicates: z.boolean().optional(),
		})
		.strict();

export const CodemodDeleteArgsSchema: z.ZodType<Prisma.CodemodDeleteArgs> = z
	.object({
		select: CodemodSelectSchema.optional(),
		where: CodemodWhereUniqueInputSchema,
	})
	.strict();

export const CodemodUpdateArgsSchema: z.ZodType<Prisma.CodemodUpdateArgs> = z
	.object({
		select: CodemodSelectSchema.optional(),
		data: z.union([
			CodemodUpdateInputSchema,
			CodemodUncheckedUpdateInputSchema,
		]),
		where: CodemodWhereUniqueInputSchema,
	})
	.strict();

export const CodemodUpdateManyArgsSchema: z.ZodType<Prisma.CodemodUpdateManyArgs> =
	z
		.object({
			data: z.union([
				CodemodUpdateManyMutationInputSchema,
				CodemodUncheckedUpdateManyInputSchema,
			]),
			where: CodemodWhereInputSchema.optional(),
		})
		.strict();

export const CodemodDeleteManyArgsSchema: z.ZodType<Prisma.CodemodDeleteManyArgs> =
	z
		.object({
			where: CodemodWhereInputSchema.optional(),
		})
		.strict();
