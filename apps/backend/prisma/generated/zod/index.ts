import { z } from 'zod';
import { Prisma } from '../../client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.DbNull;
  if (v === 'JsonNull') return Prisma.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.function(z.tuple([]), z.any()) }),
    z.record(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const CodemodScalarFieldEnumSchema = z.enum(['id','slug','shortDescription','tags','engine','applicability','arguments','name','featured','verified','private','author','amountOfUses','totalTimeSaved','openedPrs','labels','createdAt','updatedAt']);

export const CodemodVersionScalarFieldEnumSchema = z.enum(['id','version','shortDescription','engine','applicability','arguments','vsCodeLink','codemodStudioExampleLink','testProjectCommand','sourceRepo','amountOfUses','totalTimeSaved','openedPrs','s3Bucket','s3UploadKey','tags','codemodId','createdAt','updatedAt']);

export const TagScalarFieldEnumSchema = z.enum(['id','title','aliases','classification','displayName','createdAt','updatedAt']);

export const TokenMetadataScalarFieldEnumSchema = z.enum(['pepperedAccessTokenHashDigest','backendInitializationVector','encryptedUserId','createdAt','expiresAt','claims','signature']);

export const UserLoginIntentScalarFieldEnumSchema = z.enum(['id','token','createdAt','updatedAt']);

export const TokenRevocationScalarFieldEnumSchema = z.enum(['pepperedAccessTokenHashDigest','revokedAt','signature']);

export const CodeDiffScalarFieldEnumSchema = z.enum(['id','name','source','before','after','createdAt','updatedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const NullableJsonNullValueInputSchema = z.enum(['DbNull','JsonNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.JsonNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const NullsOrderSchema = z.enum(['first','last']);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// CODEMOD SCHEMA
/////////////////////////////////////////

export const CodemodSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  shortDescription: z.string().nullable(),
  tags: z.string().array(),
  engine: z.string().nullable(),
  /**
   * [ApplicabilityCriteria]
   */
  applicability: JsonValueSchema,
  /**
   * [Arguments]
   */
  arguments: JsonValueSchema,
  name: z.string(),
  featured: z.boolean(),
  verified: z.boolean(),
  private: z.boolean(),
  author: z.string(),
  amountOfUses: z.number().int(),
  totalTimeSaved: z.number().int(),
  openedPrs: z.number().int(),
  labels: z.string().array(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Codemod = z.infer<typeof CodemodSchema>

// CODEMOD OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CodemodOptionalDefaultsSchema = CodemodSchema.merge(z.object({
  id: z.number().int().optional(),
  tags: z.string().array().optional(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  amountOfUses: z.number().int().optional(),
  totalTimeSaved: z.number().int().optional(),
  openedPrs: z.number().int().optional(),
  labels: z.string().array().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type CodemodOptionalDefaults = z.infer<typeof CodemodOptionalDefaultsSchema>

/////////////////////////////////////////
// CODEMOD VERSION SCHEMA
/////////////////////////////////////////

export const CodemodVersionSchema = z.object({
  id: z.number().int(),
  version: z.string(),
  shortDescription: z.string().nullable(),
  engine: z.string(),
  /**
   * [ApplicabilityCriteria]
   */
  applicability: JsonValueSchema,
  /**
   * [Arguments]
   */
  arguments: JsonValueSchema,
  vsCodeLink: z.string(),
  codemodStudioExampleLink: z.string().nullable(),
  testProjectCommand: z.string().nullable(),
  sourceRepo: z.string().nullable(),
  amountOfUses: z.number().int(),
  totalTimeSaved: z.number().int(),
  openedPrs: z.number().int(),
  s3Bucket: z.string(),
  s3UploadKey: z.string(),
  tags: z.string().array(),
  codemodId: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CodemodVersion = z.infer<typeof CodemodVersionSchema>

// CODEMOD VERSION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CodemodVersionOptionalDefaultsSchema = CodemodVersionSchema.merge(z.object({
  id: z.number().int().optional(),
  amountOfUses: z.number().int().optional(),
  totalTimeSaved: z.number().int().optional(),
  openedPrs: z.number().int().optional(),
  tags: z.string().array().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type CodemodVersionOptionalDefaults = z.infer<typeof CodemodVersionOptionalDefaultsSchema>

/////////////////////////////////////////
// TAG SCHEMA
/////////////////////////////////////////

export const TagSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  aliases: z.string().array(),
  classification: z.string(),
  displayName: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Tag = z.infer<typeof TagSchema>

// TAG OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TagOptionalDefaultsSchema = TagSchema.merge(z.object({
  id: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type TagOptionalDefaults = z.infer<typeof TagOptionalDefaultsSchema>

/////////////////////////////////////////
// TOKEN METADATA SCHEMA
/////////////////////////////////////////

export const TokenMetadataSchema = z.object({
  pepperedAccessTokenHashDigest: z.string(),
  backendInitializationVector: z.string(),
  encryptedUserId: z.string(),
  createdAt: z.bigint(),
  expiresAt: z.bigint(),
  claims: z.bigint(),
  signature: z.string(),
})

export type TokenMetadata = z.infer<typeof TokenMetadataSchema>

// TOKEN METADATA OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TokenMetadataOptionalDefaultsSchema = TokenMetadataSchema.merge(z.object({
}))

export type TokenMetadataOptionalDefaults = z.infer<typeof TokenMetadataOptionalDefaultsSchema>

/////////////////////////////////////////
// USER LOGIN INTENT SCHEMA
/////////////////////////////////////////

export const UserLoginIntentSchema = z.object({
  id: z.string(),
  token: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserLoginIntent = z.infer<typeof UserLoginIntentSchema>

// USER LOGIN INTENT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const UserLoginIntentOptionalDefaultsSchema = UserLoginIntentSchema.merge(z.object({
  id: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type UserLoginIntentOptionalDefaults = z.infer<typeof UserLoginIntentOptionalDefaultsSchema>

/////////////////////////////////////////
// TOKEN REVOCATION SCHEMA
/////////////////////////////////////////

export const TokenRevocationSchema = z.object({
  pepperedAccessTokenHashDigest: z.string(),
  revokedAt: z.bigint(),
  signature: z.string(),
})

export type TokenRevocation = z.infer<typeof TokenRevocationSchema>

// TOKEN REVOCATION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TokenRevocationOptionalDefaultsSchema = TokenRevocationSchema.merge(z.object({
}))

export type TokenRevocationOptionalDefaults = z.infer<typeof TokenRevocationOptionalDefaultsSchema>

/////////////////////////////////////////
// CODE DIFF SCHEMA
/////////////////////////////////////////

export const CodeDiffSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  source: z.string(),
  before: z.string(),
  after: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CodeDiff = z.infer<typeof CodeDiffSchema>

// CODE DIFF OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CodeDiffOptionalDefaultsSchema = CodeDiffSchema.merge(z.object({
  id: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type CodeDiffOptionalDefaults = z.infer<typeof CodeDiffOptionalDefaultsSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// CODEMOD
//------------------------------------------------------

export const CodemodIncludeSchema: z.ZodType<Prisma.CodemodInclude> = z.object({
  versions: z.union([z.boolean(),z.lazy(() => CodemodVersionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CodemodCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const CodemodArgsSchema: z.ZodType<Prisma.CodemodDefaultArgs> = z.object({
  select: z.lazy(() => CodemodSelectSchema).optional(),
  include: z.lazy(() => CodemodIncludeSchema).optional(),
}).strict();

export const CodemodCountOutputTypeArgsSchema: z.ZodType<Prisma.CodemodCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => CodemodCountOutputTypeSelectSchema).nullish(),
}).strict();

export const CodemodCountOutputTypeSelectSchema: z.ZodType<Prisma.CodemodCountOutputTypeSelect> = z.object({
  versions: z.boolean().optional(),
}).strict();

export const CodemodSelectSchema: z.ZodType<Prisma.CodemodSelect> = z.object({
  id: z.boolean().optional(),
  slug: z.boolean().optional(),
  shortDescription: z.boolean().optional(),
  tags: z.boolean().optional(),
  engine: z.boolean().optional(),
  applicability: z.boolean().optional(),
  arguments: z.boolean().optional(),
  name: z.boolean().optional(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  private: z.boolean().optional(),
  author: z.boolean().optional(),
  amountOfUses: z.boolean().optional(),
  totalTimeSaved: z.boolean().optional(),
  openedPrs: z.boolean().optional(),
  labels: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  versions: z.union([z.boolean(),z.lazy(() => CodemodVersionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CodemodCountOutputTypeArgsSchema)]).optional(),
}).strict()

// CODEMOD VERSION
//------------------------------------------------------

export const CodemodVersionIncludeSchema: z.ZodType<Prisma.CodemodVersionInclude> = z.object({
  codemod: z.union([z.boolean(),z.lazy(() => CodemodArgsSchema)]).optional(),
}).strict()

export const CodemodVersionArgsSchema: z.ZodType<Prisma.CodemodVersionDefaultArgs> = z.object({
  select: z.lazy(() => CodemodVersionSelectSchema).optional(),
  include: z.lazy(() => CodemodVersionIncludeSchema).optional(),
}).strict();

export const CodemodVersionSelectSchema: z.ZodType<Prisma.CodemodVersionSelect> = z.object({
  id: z.boolean().optional(),
  version: z.boolean().optional(),
  shortDescription: z.boolean().optional(),
  engine: z.boolean().optional(),
  applicability: z.boolean().optional(),
  arguments: z.boolean().optional(),
  vsCodeLink: z.boolean().optional(),
  codemodStudioExampleLink: z.boolean().optional(),
  testProjectCommand: z.boolean().optional(),
  sourceRepo: z.boolean().optional(),
  amountOfUses: z.boolean().optional(),
  totalTimeSaved: z.boolean().optional(),
  openedPrs: z.boolean().optional(),
  s3Bucket: z.boolean().optional(),
  s3UploadKey: z.boolean().optional(),
  tags: z.boolean().optional(),
  codemodId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  codemod: z.union([z.boolean(),z.lazy(() => CodemodArgsSchema)]).optional(),
}).strict()

// TAG
//------------------------------------------------------

export const TagSelectSchema: z.ZodType<Prisma.TagSelect> = z.object({
  id: z.boolean().optional(),
  title: z.boolean().optional(),
  aliases: z.boolean().optional(),
  classification: z.boolean().optional(),
  displayName: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
}).strict()

// TOKEN METADATA
//------------------------------------------------------

export const TokenMetadataSelectSchema: z.ZodType<Prisma.TokenMetadataSelect> = z.object({
  pepperedAccessTokenHashDigest: z.boolean().optional(),
  backendInitializationVector: z.boolean().optional(),
  encryptedUserId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  claims: z.boolean().optional(),
  signature: z.boolean().optional(),
}).strict()

// USER LOGIN INTENT
//------------------------------------------------------

export const UserLoginIntentSelectSchema: z.ZodType<Prisma.UserLoginIntentSelect> = z.object({
  id: z.boolean().optional(),
  token: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
}).strict()

// TOKEN REVOCATION
//------------------------------------------------------

export const TokenRevocationSelectSchema: z.ZodType<Prisma.TokenRevocationSelect> = z.object({
  pepperedAccessTokenHashDigest: z.boolean().optional(),
  revokedAt: z.boolean().optional(),
  signature: z.boolean().optional(),
}).strict()

// CODE DIFF
//------------------------------------------------------

export const CodeDiffSelectSchema: z.ZodType<Prisma.CodeDiffSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  source: z.boolean().optional(),
  before: z.boolean().optional(),
  after: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const CodemodWhereInputSchema: z.ZodType<Prisma.CodemodWhereInput> = z.object({
  AND: z.union([ z.lazy(() => CodemodWhereInputSchema),z.lazy(() => CodemodWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CodemodWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CodemodWhereInputSchema),z.lazy(() => CodemodWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  shortDescription: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  tags: z.lazy(() => StringNullableListFilterSchema).optional(),
  engine: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  applicability: z.lazy(() => JsonNullableFilterSchema).optional(),
  arguments: z.lazy(() => JsonNullableFilterSchema).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  featured: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  verified: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  private: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  author: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  amountOfUses: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  totalTimeSaved: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  openedPrs: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  labels: z.lazy(() => StringNullableListFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  versions: z.lazy(() => CodemodVersionListRelationFilterSchema).optional()
}).strict();

export const CodemodOrderByWithRelationInputSchema: z.ZodType<Prisma.CodemodOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  shortDescription: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  tags: z.lazy(() => SortOrderSchema).optional(),
  engine: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  applicability: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  arguments: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  featured: z.lazy(() => SortOrderSchema).optional(),
  verified: z.lazy(() => SortOrderSchema).optional(),
  private: z.lazy(() => SortOrderSchema).optional(),
  author: z.lazy(() => SortOrderSchema).optional(),
  amountOfUses: z.lazy(() => SortOrderSchema).optional(),
  totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
  openedPrs: z.lazy(() => SortOrderSchema).optional(),
  labels: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  versions: z.lazy(() => CodemodVersionOrderByRelationAggregateInputSchema).optional()
}).strict();

export const CodemodWhereUniqueInputSchema: z.ZodType<Prisma.CodemodWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    slug: z.string(),
    name: z.string()
  }),
  z.object({
    id: z.number().int(),
    slug: z.string(),
  }),
  z.object({
    id: z.number().int(),
    name: z.string(),
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    slug: z.string(),
    name: z.string(),
  }),
  z.object({
    slug: z.string(),
  }),
  z.object({
    name: z.string(),
  }),
])
.and(z.object({
  id: z.number().int().optional(),
  slug: z.string().optional(),
  name: z.string().optional(),
  AND: z.union([ z.lazy(() => CodemodWhereInputSchema),z.lazy(() => CodemodWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CodemodWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CodemodWhereInputSchema),z.lazy(() => CodemodWhereInputSchema).array() ]).optional(),
  shortDescription: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  tags: z.lazy(() => StringNullableListFilterSchema).optional(),
  engine: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  applicability: z.lazy(() => JsonNullableFilterSchema).optional(),
  arguments: z.lazy(() => JsonNullableFilterSchema).optional(),
  featured: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  verified: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  private: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  author: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  amountOfUses: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  totalTimeSaved: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  openedPrs: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  labels: z.lazy(() => StringNullableListFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  versions: z.lazy(() => CodemodVersionListRelationFilterSchema).optional()
}).strict());

export const CodemodOrderByWithAggregationInputSchema: z.ZodType<Prisma.CodemodOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  shortDescription: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  tags: z.lazy(() => SortOrderSchema).optional(),
  engine: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  applicability: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  arguments: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  featured: z.lazy(() => SortOrderSchema).optional(),
  verified: z.lazy(() => SortOrderSchema).optional(),
  private: z.lazy(() => SortOrderSchema).optional(),
  author: z.lazy(() => SortOrderSchema).optional(),
  amountOfUses: z.lazy(() => SortOrderSchema).optional(),
  totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
  openedPrs: z.lazy(() => SortOrderSchema).optional(),
  labels: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CodemodCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => CodemodAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CodemodMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CodemodMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => CodemodSumOrderByAggregateInputSchema).optional()
}).strict();

export const CodemodScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CodemodScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => CodemodScalarWhereWithAggregatesInputSchema),z.lazy(() => CodemodScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CodemodScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CodemodScalarWhereWithAggregatesInputSchema),z.lazy(() => CodemodScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  slug: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  shortDescription: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  tags: z.lazy(() => StringNullableListFilterSchema).optional(),
  engine: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  applicability: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  arguments: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  featured: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  verified: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  private: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  author: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  amountOfUses: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  totalTimeSaved: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  openedPrs: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  labels: z.lazy(() => StringNullableListFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const CodemodVersionWhereInputSchema: z.ZodType<Prisma.CodemodVersionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => CodemodVersionWhereInputSchema),z.lazy(() => CodemodVersionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CodemodVersionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CodemodVersionWhereInputSchema),z.lazy(() => CodemodVersionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  version: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  shortDescription: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  engine: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  applicability: z.lazy(() => JsonNullableFilterSchema).optional(),
  arguments: z.lazy(() => JsonNullableFilterSchema).optional(),
  vsCodeLink: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  codemodStudioExampleLink: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  testProjectCommand: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  sourceRepo: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  amountOfUses: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  totalTimeSaved: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  openedPrs: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  s3Bucket: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  s3UploadKey: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  tags: z.lazy(() => StringNullableListFilterSchema).optional(),
  codemodId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  codemod: z.union([ z.lazy(() => CodemodRelationFilterSchema),z.lazy(() => CodemodWhereInputSchema) ]).optional(),
}).strict();

export const CodemodVersionOrderByWithRelationInputSchema: z.ZodType<Prisma.CodemodVersionOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  version: z.lazy(() => SortOrderSchema).optional(),
  shortDescription: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  engine: z.lazy(() => SortOrderSchema).optional(),
  applicability: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  arguments: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  vsCodeLink: z.lazy(() => SortOrderSchema).optional(),
  codemodStudioExampleLink: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  testProjectCommand: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  sourceRepo: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  amountOfUses: z.lazy(() => SortOrderSchema).optional(),
  totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
  openedPrs: z.lazy(() => SortOrderSchema).optional(),
  s3Bucket: z.lazy(() => SortOrderSchema).optional(),
  s3UploadKey: z.lazy(() => SortOrderSchema).optional(),
  tags: z.lazy(() => SortOrderSchema).optional(),
  codemodId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  codemod: z.lazy(() => CodemodOrderByWithRelationInputSchema).optional()
}).strict();

export const CodemodVersionWhereUniqueInputSchema: z.ZodType<Prisma.CodemodVersionWhereUniqueInput> = z.object({
  id: z.number().int()
})
.and(z.object({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => CodemodVersionWhereInputSchema),z.lazy(() => CodemodVersionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CodemodVersionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CodemodVersionWhereInputSchema),z.lazy(() => CodemodVersionWhereInputSchema).array() ]).optional(),
  version: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  shortDescription: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  engine: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  applicability: z.lazy(() => JsonNullableFilterSchema).optional(),
  arguments: z.lazy(() => JsonNullableFilterSchema).optional(),
  vsCodeLink: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  codemodStudioExampleLink: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  testProjectCommand: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  sourceRepo: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  amountOfUses: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  totalTimeSaved: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  openedPrs: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  s3Bucket: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  s3UploadKey: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  tags: z.lazy(() => StringNullableListFilterSchema).optional(),
  codemodId: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  codemod: z.union([ z.lazy(() => CodemodRelationFilterSchema),z.lazy(() => CodemodWhereInputSchema) ]).optional(),
}).strict());

export const CodemodVersionOrderByWithAggregationInputSchema: z.ZodType<Prisma.CodemodVersionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  version: z.lazy(() => SortOrderSchema).optional(),
  shortDescription: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  engine: z.lazy(() => SortOrderSchema).optional(),
  applicability: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  arguments: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  vsCodeLink: z.lazy(() => SortOrderSchema).optional(),
  codemodStudioExampleLink: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  testProjectCommand: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  sourceRepo: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  amountOfUses: z.lazy(() => SortOrderSchema).optional(),
  totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
  openedPrs: z.lazy(() => SortOrderSchema).optional(),
  s3Bucket: z.lazy(() => SortOrderSchema).optional(),
  s3UploadKey: z.lazy(() => SortOrderSchema).optional(),
  tags: z.lazy(() => SortOrderSchema).optional(),
  codemodId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CodemodVersionCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => CodemodVersionAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CodemodVersionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CodemodVersionMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => CodemodVersionSumOrderByAggregateInputSchema).optional()
}).strict();

export const CodemodVersionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CodemodVersionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => CodemodVersionScalarWhereWithAggregatesInputSchema),z.lazy(() => CodemodVersionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CodemodVersionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CodemodVersionScalarWhereWithAggregatesInputSchema),z.lazy(() => CodemodVersionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  version: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  shortDescription: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  engine: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  applicability: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  arguments: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  vsCodeLink: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  codemodStudioExampleLink: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  testProjectCommand: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  sourceRepo: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  amountOfUses: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  totalTimeSaved: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  openedPrs: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  s3Bucket: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  s3UploadKey: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  tags: z.lazy(() => StringNullableListFilterSchema).optional(),
  codemodId: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const TagWhereInputSchema: z.ZodType<Prisma.TagWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TagWhereInputSchema),z.lazy(() => TagWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TagWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TagWhereInputSchema),z.lazy(() => TagWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  aliases: z.lazy(() => StringNullableListFilterSchema).optional(),
  classification: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  displayName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const TagOrderByWithRelationInputSchema: z.ZodType<Prisma.TagOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  aliases: z.lazy(() => SortOrderSchema).optional(),
  classification: z.lazy(() => SortOrderSchema).optional(),
  displayName: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagWhereUniqueInputSchema: z.ZodType<Prisma.TagWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    title: z.string()
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    title: z.string(),
  }),
])
.and(z.object({
  id: z.number().int().optional(),
  title: z.string().optional(),
  AND: z.union([ z.lazy(() => TagWhereInputSchema),z.lazy(() => TagWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TagWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TagWhereInputSchema),z.lazy(() => TagWhereInputSchema).array() ]).optional(),
  aliases: z.lazy(() => StringNullableListFilterSchema).optional(),
  classification: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  displayName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict());

export const TagOrderByWithAggregationInputSchema: z.ZodType<Prisma.TagOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  aliases: z.lazy(() => SortOrderSchema).optional(),
  classification: z.lazy(() => SortOrderSchema).optional(),
  displayName: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TagCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => TagAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TagMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TagMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => TagSumOrderByAggregateInputSchema).optional()
}).strict();

export const TagScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TagScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TagScalarWhereWithAggregatesInputSchema),z.lazy(() => TagScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TagScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TagScalarWhereWithAggregatesInputSchema),z.lazy(() => TagScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  aliases: z.lazy(() => StringNullableListFilterSchema).optional(),
  classification: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  displayName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const TokenMetadataWhereInputSchema: z.ZodType<Prisma.TokenMetadataWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TokenMetadataWhereInputSchema),z.lazy(() => TokenMetadataWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TokenMetadataWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TokenMetadataWhereInputSchema),z.lazy(() => TokenMetadataWhereInputSchema).array() ]).optional(),
  pepperedAccessTokenHashDigest: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  backendInitializationVector: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  encryptedUserId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => BigIntFilterSchema),z.bigint() ]).optional(),
  expiresAt: z.union([ z.lazy(() => BigIntFilterSchema),z.bigint() ]).optional(),
  claims: z.union([ z.lazy(() => BigIntFilterSchema),z.bigint() ]).optional(),
  signature: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const TokenMetadataOrderByWithRelationInputSchema: z.ZodType<Prisma.TokenMetadataOrderByWithRelationInput> = z.object({
  pepperedAccessTokenHashDigest: z.lazy(() => SortOrderSchema).optional(),
  backendInitializationVector: z.lazy(() => SortOrderSchema).optional(),
  encryptedUserId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  claims: z.lazy(() => SortOrderSchema).optional(),
  signature: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TokenMetadataWhereUniqueInputSchema: z.ZodType<Prisma.TokenMetadataWhereUniqueInput> = z.object({
  pepperedAccessTokenHashDigest: z.string()
})
.and(z.object({
  pepperedAccessTokenHashDigest: z.string().optional(),
  AND: z.union([ z.lazy(() => TokenMetadataWhereInputSchema),z.lazy(() => TokenMetadataWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TokenMetadataWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TokenMetadataWhereInputSchema),z.lazy(() => TokenMetadataWhereInputSchema).array() ]).optional(),
  backendInitializationVector: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  encryptedUserId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => BigIntFilterSchema),z.bigint() ]).optional(),
  expiresAt: z.union([ z.lazy(() => BigIntFilterSchema),z.bigint() ]).optional(),
  claims: z.union([ z.lazy(() => BigIntFilterSchema),z.bigint() ]).optional(),
  signature: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict());

export const TokenMetadataOrderByWithAggregationInputSchema: z.ZodType<Prisma.TokenMetadataOrderByWithAggregationInput> = z.object({
  pepperedAccessTokenHashDigest: z.lazy(() => SortOrderSchema).optional(),
  backendInitializationVector: z.lazy(() => SortOrderSchema).optional(),
  encryptedUserId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  claims: z.lazy(() => SortOrderSchema).optional(),
  signature: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TokenMetadataCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => TokenMetadataAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TokenMetadataMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TokenMetadataMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => TokenMetadataSumOrderByAggregateInputSchema).optional()
}).strict();

export const TokenMetadataScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TokenMetadataScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TokenMetadataScalarWhereWithAggregatesInputSchema),z.lazy(() => TokenMetadataScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TokenMetadataScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TokenMetadataScalarWhereWithAggregatesInputSchema),z.lazy(() => TokenMetadataScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  pepperedAccessTokenHashDigest: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  backendInitializationVector: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  encryptedUserId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => BigIntWithAggregatesFilterSchema),z.bigint() ]).optional(),
  expiresAt: z.union([ z.lazy(() => BigIntWithAggregatesFilterSchema),z.bigint() ]).optional(),
  claims: z.union([ z.lazy(() => BigIntWithAggregatesFilterSchema),z.bigint() ]).optional(),
  signature: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const UserLoginIntentWhereInputSchema: z.ZodType<Prisma.UserLoginIntentWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserLoginIntentWhereInputSchema),z.lazy(() => UserLoginIntentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserLoginIntentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserLoginIntentWhereInputSchema),z.lazy(() => UserLoginIntentWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema),z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserLoginIntentOrderByWithRelationInputSchema: z.ZodType<Prisma.UserLoginIntentOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserLoginIntentWhereUniqueInputSchema: z.ZodType<Prisma.UserLoginIntentWhereUniqueInput> = z.object({
  id: z.string()
})
.and(z.object({
  id: z.string().optional(),
  AND: z.union([ z.lazy(() => UserLoginIntentWhereInputSchema),z.lazy(() => UserLoginIntentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserLoginIntentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserLoginIntentWhereInputSchema),z.lazy(() => UserLoginIntentWhereInputSchema).array() ]).optional(),
  token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict());

export const UserLoginIntentOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserLoginIntentOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserLoginIntentCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserLoginIntentMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserLoginIntentMinOrderByAggregateInputSchema).optional()
}).strict();

export const UserLoginIntentScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserLoginIntentScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserLoginIntentScalarWhereWithAggregatesInputSchema),z.lazy(() => UserLoginIntentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserLoginIntentScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserLoginIntentScalarWhereWithAggregatesInputSchema),z.lazy(() => UserLoginIntentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema),z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const TokenRevocationWhereInputSchema: z.ZodType<Prisma.TokenRevocationWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TokenRevocationWhereInputSchema),z.lazy(() => TokenRevocationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TokenRevocationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TokenRevocationWhereInputSchema),z.lazy(() => TokenRevocationWhereInputSchema).array() ]).optional(),
  pepperedAccessTokenHashDigest: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  revokedAt: z.union([ z.lazy(() => BigIntFilterSchema),z.bigint() ]).optional(),
  signature: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const TokenRevocationOrderByWithRelationInputSchema: z.ZodType<Prisma.TokenRevocationOrderByWithRelationInput> = z.object({
  pepperedAccessTokenHashDigest: z.lazy(() => SortOrderSchema).optional(),
  revokedAt: z.lazy(() => SortOrderSchema).optional(),
  signature: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TokenRevocationWhereUniqueInputSchema: z.ZodType<Prisma.TokenRevocationWhereUniqueInput> = z.object({
  pepperedAccessTokenHashDigest: z.string()
})
.and(z.object({
  pepperedAccessTokenHashDigest: z.string().optional(),
  AND: z.union([ z.lazy(() => TokenRevocationWhereInputSchema),z.lazy(() => TokenRevocationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TokenRevocationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TokenRevocationWhereInputSchema),z.lazy(() => TokenRevocationWhereInputSchema).array() ]).optional(),
  revokedAt: z.union([ z.lazy(() => BigIntFilterSchema),z.bigint() ]).optional(),
  signature: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict());

export const TokenRevocationOrderByWithAggregationInputSchema: z.ZodType<Prisma.TokenRevocationOrderByWithAggregationInput> = z.object({
  pepperedAccessTokenHashDigest: z.lazy(() => SortOrderSchema).optional(),
  revokedAt: z.lazy(() => SortOrderSchema).optional(),
  signature: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TokenRevocationCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => TokenRevocationAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TokenRevocationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TokenRevocationMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => TokenRevocationSumOrderByAggregateInputSchema).optional()
}).strict();

export const TokenRevocationScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TokenRevocationScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TokenRevocationScalarWhereWithAggregatesInputSchema),z.lazy(() => TokenRevocationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TokenRevocationScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TokenRevocationScalarWhereWithAggregatesInputSchema),z.lazy(() => TokenRevocationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  pepperedAccessTokenHashDigest: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  revokedAt: z.union([ z.lazy(() => BigIntWithAggregatesFilterSchema),z.bigint() ]).optional(),
  signature: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const CodeDiffWhereInputSchema: z.ZodType<Prisma.CodeDiffWhereInput> = z.object({
  AND: z.union([ z.lazy(() => CodeDiffWhereInputSchema),z.lazy(() => CodeDiffWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CodeDiffWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CodeDiffWhereInputSchema),z.lazy(() => CodeDiffWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  source: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  before: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  after: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const CodeDiffOrderByWithRelationInputSchema: z.ZodType<Prisma.CodeDiffOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  source: z.lazy(() => SortOrderSchema).optional(),
  before: z.lazy(() => SortOrderSchema).optional(),
  after: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CodeDiffWhereUniqueInputSchema: z.ZodType<Prisma.CodeDiffWhereUniqueInput> = z.object({
  id: z.string()
})
.and(z.object({
  id: z.string().optional(),
  AND: z.union([ z.lazy(() => CodeDiffWhereInputSchema),z.lazy(() => CodeDiffWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CodeDiffWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CodeDiffWhereInputSchema),z.lazy(() => CodeDiffWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  source: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  before: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  after: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict());

export const CodeDiffOrderByWithAggregationInputSchema: z.ZodType<Prisma.CodeDiffOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  source: z.lazy(() => SortOrderSchema).optional(),
  before: z.lazy(() => SortOrderSchema).optional(),
  after: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CodeDiffCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CodeDiffMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CodeDiffMinOrderByAggregateInputSchema).optional()
}).strict();

export const CodeDiffScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CodeDiffScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => CodeDiffScalarWhereWithAggregatesInputSchema),z.lazy(() => CodeDiffScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CodeDiffScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CodeDiffScalarWhereWithAggregatesInputSchema),z.lazy(() => CodeDiffScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  source: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  before: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  after: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const CodemodCreateInputSchema: z.ZodType<Prisma.CodemodCreateInput> = z.object({
  slug: z.string(),
  shortDescription: z.string().optional().nullable(),
  tags: z.union([ z.lazy(() => CodemodCreatetagsInputSchema),z.string().array() ]).optional(),
  engine: z.string().optional().nullable(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  name: z.string(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  private: z.boolean(),
  author: z.string(),
  amountOfUses: z.number().int().optional(),
  totalTimeSaved: z.number().int().optional(),
  openedPrs: z.number().int().optional(),
  labels: z.union([ z.lazy(() => CodemodCreatelabelsInputSchema),z.string().array() ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  versions: z.lazy(() => CodemodVersionCreateNestedManyWithoutCodemodInputSchema).optional()
}).strict();

export const CodemodUncheckedCreateInputSchema: z.ZodType<Prisma.CodemodUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  slug: z.string(),
  shortDescription: z.string().optional().nullable(),
  tags: z.union([ z.lazy(() => CodemodCreatetagsInputSchema),z.string().array() ]).optional(),
  engine: z.string().optional().nullable(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  name: z.string(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  private: z.boolean(),
  author: z.string(),
  amountOfUses: z.number().int().optional(),
  totalTimeSaved: z.number().int().optional(),
  openedPrs: z.number().int().optional(),
  labels: z.union([ z.lazy(() => CodemodCreatelabelsInputSchema),z.string().array() ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  versions: z.lazy(() => CodemodVersionUncheckedCreateNestedManyWithoutCodemodInputSchema).optional()
}).strict();

export const CodemodUpdateInputSchema: z.ZodType<Prisma.CodemodUpdateInput> = z.object({
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDescription: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => CodemodUpdatetagsInputSchema),z.string().array() ]).optional(),
  engine: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  featured: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  private: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  author: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amountOfUses: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTimeSaved: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  openedPrs: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  labels: z.union([ z.lazy(() => CodemodUpdatelabelsInputSchema),z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  versions: z.lazy(() => CodemodVersionUpdateManyWithoutCodemodNestedInputSchema).optional()
}).strict();

export const CodemodUncheckedUpdateInputSchema: z.ZodType<Prisma.CodemodUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDescription: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => CodemodUpdatetagsInputSchema),z.string().array() ]).optional(),
  engine: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  featured: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  private: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  author: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amountOfUses: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTimeSaved: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  openedPrs: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  labels: z.union([ z.lazy(() => CodemodUpdatelabelsInputSchema),z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  versions: z.lazy(() => CodemodVersionUncheckedUpdateManyWithoutCodemodNestedInputSchema).optional()
}).strict();

export const CodemodCreateManyInputSchema: z.ZodType<Prisma.CodemodCreateManyInput> = z.object({
  id: z.number().int().optional(),
  slug: z.string(),
  shortDescription: z.string().optional().nullable(),
  tags: z.union([ z.lazy(() => CodemodCreatetagsInputSchema),z.string().array() ]).optional(),
  engine: z.string().optional().nullable(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  name: z.string(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  private: z.boolean(),
  author: z.string(),
  amountOfUses: z.number().int().optional(),
  totalTimeSaved: z.number().int().optional(),
  openedPrs: z.number().int().optional(),
  labels: z.union([ z.lazy(() => CodemodCreatelabelsInputSchema),z.string().array() ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const CodemodUpdateManyMutationInputSchema: z.ZodType<Prisma.CodemodUpdateManyMutationInput> = z.object({
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDescription: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => CodemodUpdatetagsInputSchema),z.string().array() ]).optional(),
  engine: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  featured: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  private: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  author: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amountOfUses: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTimeSaved: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  openedPrs: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  labels: z.union([ z.lazy(() => CodemodUpdatelabelsInputSchema),z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CodemodUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CodemodUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDescription: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => CodemodUpdatetagsInputSchema),z.string().array() ]).optional(),
  engine: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  featured: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  private: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  author: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amountOfUses: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTimeSaved: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  openedPrs: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  labels: z.union([ z.lazy(() => CodemodUpdatelabelsInputSchema),z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CodemodVersionCreateInputSchema: z.ZodType<Prisma.CodemodVersionCreateInput> = z.object({
  version: z.string(),
  shortDescription: z.string().optional().nullable(),
  engine: z.string(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  vsCodeLink: z.string(),
  codemodStudioExampleLink: z.string().optional().nullable(),
  testProjectCommand: z.string().optional().nullable(),
  sourceRepo: z.string().optional().nullable(),
  amountOfUses: z.number().int().optional(),
  totalTimeSaved: z.number().int().optional(),
  openedPrs: z.number().int().optional(),
  s3Bucket: z.string(),
  s3UploadKey: z.string(),
  tags: z.union([ z.lazy(() => CodemodVersionCreatetagsInputSchema),z.string().array() ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  codemod: z.lazy(() => CodemodCreateNestedOneWithoutVersionsInputSchema)
}).strict();

export const CodemodVersionUncheckedCreateInputSchema: z.ZodType<Prisma.CodemodVersionUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  version: z.string(),
  shortDescription: z.string().optional().nullable(),
  engine: z.string(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  vsCodeLink: z.string(),
  codemodStudioExampleLink: z.string().optional().nullable(),
  testProjectCommand: z.string().optional().nullable(),
  sourceRepo: z.string().optional().nullable(),
  amountOfUses: z.number().int().optional(),
  totalTimeSaved: z.number().int().optional(),
  openedPrs: z.number().int().optional(),
  s3Bucket: z.string(),
  s3UploadKey: z.string(),
  tags: z.union([ z.lazy(() => CodemodVersionCreatetagsInputSchema),z.string().array() ]).optional(),
  codemodId: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const CodemodVersionUpdateInputSchema: z.ZodType<Prisma.CodemodVersionUpdateInput> = z.object({
  version: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDescription: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  engine: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  vsCodeLink: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  codemodStudioExampleLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  testProjectCommand: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sourceRepo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amountOfUses: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTimeSaved: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  openedPrs: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  s3Bucket: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  s3UploadKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  tags: z.union([ z.lazy(() => CodemodVersionUpdatetagsInputSchema),z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  codemod: z.lazy(() => CodemodUpdateOneRequiredWithoutVersionsNestedInputSchema).optional()
}).strict();

export const CodemodVersionUncheckedUpdateInputSchema: z.ZodType<Prisma.CodemodVersionUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  version: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDescription: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  engine: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  vsCodeLink: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  codemodStudioExampleLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  testProjectCommand: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sourceRepo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amountOfUses: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTimeSaved: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  openedPrs: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  s3Bucket: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  s3UploadKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  tags: z.union([ z.lazy(() => CodemodVersionUpdatetagsInputSchema),z.string().array() ]).optional(),
  codemodId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CodemodVersionCreateManyInputSchema: z.ZodType<Prisma.CodemodVersionCreateManyInput> = z.object({
  id: z.number().int().optional(),
  version: z.string(),
  shortDescription: z.string().optional().nullable(),
  engine: z.string(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  vsCodeLink: z.string(),
  codemodStudioExampleLink: z.string().optional().nullable(),
  testProjectCommand: z.string().optional().nullable(),
  sourceRepo: z.string().optional().nullable(),
  amountOfUses: z.number().int().optional(),
  totalTimeSaved: z.number().int().optional(),
  openedPrs: z.number().int().optional(),
  s3Bucket: z.string(),
  s3UploadKey: z.string(),
  tags: z.union([ z.lazy(() => CodemodVersionCreatetagsInputSchema),z.string().array() ]).optional(),
  codemodId: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const CodemodVersionUpdateManyMutationInputSchema: z.ZodType<Prisma.CodemodVersionUpdateManyMutationInput> = z.object({
  version: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDescription: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  engine: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  vsCodeLink: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  codemodStudioExampleLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  testProjectCommand: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sourceRepo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amountOfUses: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTimeSaved: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  openedPrs: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  s3Bucket: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  s3UploadKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  tags: z.union([ z.lazy(() => CodemodVersionUpdatetagsInputSchema),z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CodemodVersionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CodemodVersionUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  version: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDescription: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  engine: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  vsCodeLink: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  codemodStudioExampleLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  testProjectCommand: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sourceRepo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amountOfUses: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTimeSaved: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  openedPrs: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  s3Bucket: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  s3UploadKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  tags: z.union([ z.lazy(() => CodemodVersionUpdatetagsInputSchema),z.string().array() ]).optional(),
  codemodId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TagCreateInputSchema: z.ZodType<Prisma.TagCreateInput> = z.object({
  title: z.string(),
  aliases: z.union([ z.lazy(() => TagCreatealiasesInputSchema),z.string().array() ]).optional(),
  classification: z.string(),
  displayName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const TagUncheckedCreateInputSchema: z.ZodType<Prisma.TagUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  title: z.string(),
  aliases: z.union([ z.lazy(() => TagCreatealiasesInputSchema),z.string().array() ]).optional(),
  classification: z.string(),
  displayName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const TagUpdateInputSchema: z.ZodType<Prisma.TagUpdateInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  aliases: z.union([ z.lazy(() => TagUpdatealiasesInputSchema),z.string().array() ]).optional(),
  classification: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  displayName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TagUncheckedUpdateInputSchema: z.ZodType<Prisma.TagUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  aliases: z.union([ z.lazy(() => TagUpdatealiasesInputSchema),z.string().array() ]).optional(),
  classification: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  displayName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TagCreateManyInputSchema: z.ZodType<Prisma.TagCreateManyInput> = z.object({
  id: z.number().int().optional(),
  title: z.string(),
  aliases: z.union([ z.lazy(() => TagCreatealiasesInputSchema),z.string().array() ]).optional(),
  classification: z.string(),
  displayName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const TagUpdateManyMutationInputSchema: z.ZodType<Prisma.TagUpdateManyMutationInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  aliases: z.union([ z.lazy(() => TagUpdatealiasesInputSchema),z.string().array() ]).optional(),
  classification: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  displayName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TagUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TagUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  aliases: z.union([ z.lazy(() => TagUpdatealiasesInputSchema),z.string().array() ]).optional(),
  classification: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  displayName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TokenMetadataCreateInputSchema: z.ZodType<Prisma.TokenMetadataCreateInput> = z.object({
  pepperedAccessTokenHashDigest: z.string(),
  backendInitializationVector: z.string(),
  encryptedUserId: z.string(),
  createdAt: z.bigint(),
  expiresAt: z.bigint(),
  claims: z.bigint(),
  signature: z.string()
}).strict();

export const TokenMetadataUncheckedCreateInputSchema: z.ZodType<Prisma.TokenMetadataUncheckedCreateInput> = z.object({
  pepperedAccessTokenHashDigest: z.string(),
  backendInitializationVector: z.string(),
  encryptedUserId: z.string(),
  createdAt: z.bigint(),
  expiresAt: z.bigint(),
  claims: z.bigint(),
  signature: z.string()
}).strict();

export const TokenMetadataUpdateInputSchema: z.ZodType<Prisma.TokenMetadataUpdateInput> = z.object({
  pepperedAccessTokenHashDigest: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  backendInitializationVector: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  encryptedUserId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  claims: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  signature: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TokenMetadataUncheckedUpdateInputSchema: z.ZodType<Prisma.TokenMetadataUncheckedUpdateInput> = z.object({
  pepperedAccessTokenHashDigest: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  backendInitializationVector: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  encryptedUserId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  claims: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  signature: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TokenMetadataCreateManyInputSchema: z.ZodType<Prisma.TokenMetadataCreateManyInput> = z.object({
  pepperedAccessTokenHashDigest: z.string(),
  backendInitializationVector: z.string(),
  encryptedUserId: z.string(),
  createdAt: z.bigint(),
  expiresAt: z.bigint(),
  claims: z.bigint(),
  signature: z.string()
}).strict();

export const TokenMetadataUpdateManyMutationInputSchema: z.ZodType<Prisma.TokenMetadataUpdateManyMutationInput> = z.object({
  pepperedAccessTokenHashDigest: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  backendInitializationVector: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  encryptedUserId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  claims: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  signature: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TokenMetadataUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TokenMetadataUncheckedUpdateManyInput> = z.object({
  pepperedAccessTokenHashDigest: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  backendInitializationVector: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  encryptedUserId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  claims: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  signature: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserLoginIntentCreateInputSchema: z.ZodType<Prisma.UserLoginIntentCreateInput> = z.object({
  id: z.string().optional(),
  token: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserLoginIntentUncheckedCreateInputSchema: z.ZodType<Prisma.UserLoginIntentUncheckedCreateInput> = z.object({
  id: z.string().optional(),
  token: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserLoginIntentUpdateInputSchema: z.ZodType<Prisma.UserLoginIntentUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserLoginIntentUncheckedUpdateInputSchema: z.ZodType<Prisma.UserLoginIntentUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserLoginIntentCreateManyInputSchema: z.ZodType<Prisma.UserLoginIntentCreateManyInput> = z.object({
  id: z.string().optional(),
  token: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserLoginIntentUpdateManyMutationInputSchema: z.ZodType<Prisma.UserLoginIntentUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserLoginIntentUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserLoginIntentUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TokenRevocationCreateInputSchema: z.ZodType<Prisma.TokenRevocationCreateInput> = z.object({
  pepperedAccessTokenHashDigest: z.string(),
  revokedAt: z.bigint(),
  signature: z.string()
}).strict();

export const TokenRevocationUncheckedCreateInputSchema: z.ZodType<Prisma.TokenRevocationUncheckedCreateInput> = z.object({
  pepperedAccessTokenHashDigest: z.string(),
  revokedAt: z.bigint(),
  signature: z.string()
}).strict();

export const TokenRevocationUpdateInputSchema: z.ZodType<Prisma.TokenRevocationUpdateInput> = z.object({
  pepperedAccessTokenHashDigest: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  revokedAt: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  signature: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TokenRevocationUncheckedUpdateInputSchema: z.ZodType<Prisma.TokenRevocationUncheckedUpdateInput> = z.object({
  pepperedAccessTokenHashDigest: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  revokedAt: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  signature: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TokenRevocationCreateManyInputSchema: z.ZodType<Prisma.TokenRevocationCreateManyInput> = z.object({
  pepperedAccessTokenHashDigest: z.string(),
  revokedAt: z.bigint(),
  signature: z.string()
}).strict();

export const TokenRevocationUpdateManyMutationInputSchema: z.ZodType<Prisma.TokenRevocationUpdateManyMutationInput> = z.object({
  pepperedAccessTokenHashDigest: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  revokedAt: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  signature: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TokenRevocationUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TokenRevocationUncheckedUpdateManyInput> = z.object({
  pepperedAccessTokenHashDigest: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  revokedAt: z.union([ z.bigint(),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  signature: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CodeDiffCreateInputSchema: z.ZodType<Prisma.CodeDiffCreateInput> = z.object({
  id: z.string().optional(),
  name: z.string().optional().nullable(),
  source: z.string(),
  before: z.string(),
  after: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const CodeDiffUncheckedCreateInputSchema: z.ZodType<Prisma.CodeDiffUncheckedCreateInput> = z.object({
  id: z.string().optional(),
  name: z.string().optional().nullable(),
  source: z.string(),
  before: z.string(),
  after: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const CodeDiffUpdateInputSchema: z.ZodType<Prisma.CodeDiffUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  source: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  before: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  after: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CodeDiffUncheckedUpdateInputSchema: z.ZodType<Prisma.CodeDiffUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  source: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  before: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  after: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CodeDiffCreateManyInputSchema: z.ZodType<Prisma.CodeDiffCreateManyInput> = z.object({
  id: z.string().optional(),
  name: z.string().optional().nullable(),
  source: z.string(),
  before: z.string(),
  after: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const CodeDiffUpdateManyMutationInputSchema: z.ZodType<Prisma.CodeDiffUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  source: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  before: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  after: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CodeDiffUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CodeDiffUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  source: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  before: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  after: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
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
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
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
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const StringNullableListFilterSchema: z.ZodType<Prisma.StringNullableListFilter> = z.object({
  equals: z.string().array().optional().nullable(),
  has: z.string().optional().nullable(),
  hasEvery: z.string().array().optional(),
  hasSome: z.string().array().optional(),
  isEmpty: z.boolean().optional()
}).strict();

export const JsonNullableFilterSchema: z.ZodType<Prisma.JsonNullableFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional()
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const CodemodVersionListRelationFilterSchema: z.ZodType<Prisma.CodemodVersionListRelationFilter> = z.object({
  every: z.lazy(() => CodemodVersionWhereInputSchema).optional(),
  some: z.lazy(() => CodemodVersionWhereInputSchema).optional(),
  none: z.lazy(() => CodemodVersionWhereInputSchema).optional()
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const CodemodVersionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CodemodVersionOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CodemodCountOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  shortDescription: z.lazy(() => SortOrderSchema).optional(),
  tags: z.lazy(() => SortOrderSchema).optional(),
  engine: z.lazy(() => SortOrderSchema).optional(),
  applicability: z.lazy(() => SortOrderSchema).optional(),
  arguments: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  featured: z.lazy(() => SortOrderSchema).optional(),
  verified: z.lazy(() => SortOrderSchema).optional(),
  private: z.lazy(() => SortOrderSchema).optional(),
  author: z.lazy(() => SortOrderSchema).optional(),
  amountOfUses: z.lazy(() => SortOrderSchema).optional(),
  totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
  openedPrs: z.lazy(() => SortOrderSchema).optional(),
  labels: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CodemodAvgOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  amountOfUses: z.lazy(() => SortOrderSchema).optional(),
  totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
  openedPrs: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CodemodMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  shortDescription: z.lazy(() => SortOrderSchema).optional(),
  engine: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  featured: z.lazy(() => SortOrderSchema).optional(),
  verified: z.lazy(() => SortOrderSchema).optional(),
  private: z.lazy(() => SortOrderSchema).optional(),
  author: z.lazy(() => SortOrderSchema).optional(),
  amountOfUses: z.lazy(() => SortOrderSchema).optional(),
  totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
  openedPrs: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CodemodMinOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  shortDescription: z.lazy(() => SortOrderSchema).optional(),
  engine: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  featured: z.lazy(() => SortOrderSchema).optional(),
  verified: z.lazy(() => SortOrderSchema).optional(),
  private: z.lazy(() => SortOrderSchema).optional(),
  author: z.lazy(() => SortOrderSchema).optional(),
  amountOfUses: z.lazy(() => SortOrderSchema).optional(),
  totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
  openedPrs: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CodemodSumOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  amountOfUses: z.lazy(() => SortOrderSchema).optional(),
  totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
  openedPrs: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
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
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
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
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const JsonNullableWithAggregatesFilterSchema: z.ZodType<Prisma.JsonNullableWithAggregatesFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedJsonNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedJsonNullableFilterSchema).optional()
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const CodemodRelationFilterSchema: z.ZodType<Prisma.CodemodRelationFilter> = z.object({
  is: z.lazy(() => CodemodWhereInputSchema).optional(),
  isNot: z.lazy(() => CodemodWhereInputSchema).optional()
}).strict();

export const CodemodVersionCountOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodVersionCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  version: z.lazy(() => SortOrderSchema).optional(),
  shortDescription: z.lazy(() => SortOrderSchema).optional(),
  engine: z.lazy(() => SortOrderSchema).optional(),
  applicability: z.lazy(() => SortOrderSchema).optional(),
  arguments: z.lazy(() => SortOrderSchema).optional(),
  vsCodeLink: z.lazy(() => SortOrderSchema).optional(),
  codemodStudioExampleLink: z.lazy(() => SortOrderSchema).optional(),
  testProjectCommand: z.lazy(() => SortOrderSchema).optional(),
  sourceRepo: z.lazy(() => SortOrderSchema).optional(),
  amountOfUses: z.lazy(() => SortOrderSchema).optional(),
  totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
  openedPrs: z.lazy(() => SortOrderSchema).optional(),
  s3Bucket: z.lazy(() => SortOrderSchema).optional(),
  s3UploadKey: z.lazy(() => SortOrderSchema).optional(),
  tags: z.lazy(() => SortOrderSchema).optional(),
  codemodId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CodemodVersionAvgOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodVersionAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  amountOfUses: z.lazy(() => SortOrderSchema).optional(),
  totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
  openedPrs: z.lazy(() => SortOrderSchema).optional(),
  codemodId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CodemodVersionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodVersionMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  version: z.lazy(() => SortOrderSchema).optional(),
  shortDescription: z.lazy(() => SortOrderSchema).optional(),
  engine: z.lazy(() => SortOrderSchema).optional(),
  vsCodeLink: z.lazy(() => SortOrderSchema).optional(),
  codemodStudioExampleLink: z.lazy(() => SortOrderSchema).optional(),
  testProjectCommand: z.lazy(() => SortOrderSchema).optional(),
  sourceRepo: z.lazy(() => SortOrderSchema).optional(),
  amountOfUses: z.lazy(() => SortOrderSchema).optional(),
  totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
  openedPrs: z.lazy(() => SortOrderSchema).optional(),
  s3Bucket: z.lazy(() => SortOrderSchema).optional(),
  s3UploadKey: z.lazy(() => SortOrderSchema).optional(),
  codemodId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CodemodVersionMinOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodVersionMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  version: z.lazy(() => SortOrderSchema).optional(),
  shortDescription: z.lazy(() => SortOrderSchema).optional(),
  engine: z.lazy(() => SortOrderSchema).optional(),
  vsCodeLink: z.lazy(() => SortOrderSchema).optional(),
  codemodStudioExampleLink: z.lazy(() => SortOrderSchema).optional(),
  testProjectCommand: z.lazy(() => SortOrderSchema).optional(),
  sourceRepo: z.lazy(() => SortOrderSchema).optional(),
  amountOfUses: z.lazy(() => SortOrderSchema).optional(),
  totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
  openedPrs: z.lazy(() => SortOrderSchema).optional(),
  s3Bucket: z.lazy(() => SortOrderSchema).optional(),
  s3UploadKey: z.lazy(() => SortOrderSchema).optional(),
  codemodId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CodemodVersionSumOrderByAggregateInputSchema: z.ZodType<Prisma.CodemodVersionSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  amountOfUses: z.lazy(() => SortOrderSchema).optional(),
  totalTimeSaved: z.lazy(() => SortOrderSchema).optional(),
  openedPrs: z.lazy(() => SortOrderSchema).optional(),
  codemodId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagCountOrderByAggregateInputSchema: z.ZodType<Prisma.TagCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  aliases: z.lazy(() => SortOrderSchema).optional(),
  classification: z.lazy(() => SortOrderSchema).optional(),
  displayName: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagAvgOrderByAggregateInputSchema: z.ZodType<Prisma.TagAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TagMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  classification: z.lazy(() => SortOrderSchema).optional(),
  displayName: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagMinOrderByAggregateInputSchema: z.ZodType<Prisma.TagMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  classification: z.lazy(() => SortOrderSchema).optional(),
  displayName: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagSumOrderByAggregateInputSchema: z.ZodType<Prisma.TagSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BigIntFilterSchema: z.ZodType<Prisma.BigIntFilter> = z.object({
  equals: z.bigint().optional(),
  in: z.bigint().array().optional(),
  notIn: z.bigint().array().optional(),
  lt: z.bigint().optional(),
  lte: z.bigint().optional(),
  gt: z.bigint().optional(),
  gte: z.bigint().optional(),
  not: z.union([ z.bigint(),z.lazy(() => NestedBigIntFilterSchema) ]).optional(),
}).strict();

export const TokenMetadataCountOrderByAggregateInputSchema: z.ZodType<Prisma.TokenMetadataCountOrderByAggregateInput> = z.object({
  pepperedAccessTokenHashDigest: z.lazy(() => SortOrderSchema).optional(),
  backendInitializationVector: z.lazy(() => SortOrderSchema).optional(),
  encryptedUserId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  claims: z.lazy(() => SortOrderSchema).optional(),
  signature: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TokenMetadataAvgOrderByAggregateInputSchema: z.ZodType<Prisma.TokenMetadataAvgOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  claims: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TokenMetadataMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TokenMetadataMaxOrderByAggregateInput> = z.object({
  pepperedAccessTokenHashDigest: z.lazy(() => SortOrderSchema).optional(),
  backendInitializationVector: z.lazy(() => SortOrderSchema).optional(),
  encryptedUserId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  claims: z.lazy(() => SortOrderSchema).optional(),
  signature: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TokenMetadataMinOrderByAggregateInputSchema: z.ZodType<Prisma.TokenMetadataMinOrderByAggregateInput> = z.object({
  pepperedAccessTokenHashDigest: z.lazy(() => SortOrderSchema).optional(),
  backendInitializationVector: z.lazy(() => SortOrderSchema).optional(),
  encryptedUserId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  claims: z.lazy(() => SortOrderSchema).optional(),
  signature: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TokenMetadataSumOrderByAggregateInputSchema: z.ZodType<Prisma.TokenMetadataSumOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  claims: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BigIntWithAggregatesFilterSchema: z.ZodType<Prisma.BigIntWithAggregatesFilter> = z.object({
  equals: z.bigint().optional(),
  in: z.bigint().array().optional(),
  notIn: z.bigint().array().optional(),
  lt: z.bigint().optional(),
  lte: z.bigint().optional(),
  gt: z.bigint().optional(),
  gte: z.bigint().optional(),
  not: z.union([ z.bigint(),z.lazy(() => NestedBigIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedBigIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBigIntFilterSchema).optional(),
  _max: z.lazy(() => NestedBigIntFilterSchema).optional()
}).strict();

export const UuidFilterSchema: z.ZodType<Prisma.UuidFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidFilterSchema) ]).optional(),
}).strict();

export const UserLoginIntentCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserLoginIntentCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserLoginIntentMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserLoginIntentMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserLoginIntentMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserLoginIntentMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UuidWithAggregatesFilterSchema: z.ZodType<Prisma.UuidWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const TokenRevocationCountOrderByAggregateInputSchema: z.ZodType<Prisma.TokenRevocationCountOrderByAggregateInput> = z.object({
  pepperedAccessTokenHashDigest: z.lazy(() => SortOrderSchema).optional(),
  revokedAt: z.lazy(() => SortOrderSchema).optional(),
  signature: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TokenRevocationAvgOrderByAggregateInputSchema: z.ZodType<Prisma.TokenRevocationAvgOrderByAggregateInput> = z.object({
  revokedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TokenRevocationMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TokenRevocationMaxOrderByAggregateInput> = z.object({
  pepperedAccessTokenHashDigest: z.lazy(() => SortOrderSchema).optional(),
  revokedAt: z.lazy(() => SortOrderSchema).optional(),
  signature: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TokenRevocationMinOrderByAggregateInputSchema: z.ZodType<Prisma.TokenRevocationMinOrderByAggregateInput> = z.object({
  pepperedAccessTokenHashDigest: z.lazy(() => SortOrderSchema).optional(),
  revokedAt: z.lazy(() => SortOrderSchema).optional(),
  signature: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TokenRevocationSumOrderByAggregateInputSchema: z.ZodType<Prisma.TokenRevocationSumOrderByAggregateInput> = z.object({
  revokedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CodeDiffCountOrderByAggregateInputSchema: z.ZodType<Prisma.CodeDiffCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  source: z.lazy(() => SortOrderSchema).optional(),
  before: z.lazy(() => SortOrderSchema).optional(),
  after: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CodeDiffMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CodeDiffMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  source: z.lazy(() => SortOrderSchema).optional(),
  before: z.lazy(() => SortOrderSchema).optional(),
  after: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CodeDiffMinOrderByAggregateInputSchema: z.ZodType<Prisma.CodeDiffMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  source: z.lazy(() => SortOrderSchema).optional(),
  before: z.lazy(() => SortOrderSchema).optional(),
  after: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const CodemodCreatetagsInputSchema: z.ZodType<Prisma.CodemodCreatetagsInput> = z.object({
  set: z.string().array()
}).strict();

export const CodemodCreatelabelsInputSchema: z.ZodType<Prisma.CodemodCreatelabelsInput> = z.object({
  set: z.string().array()
}).strict();

export const CodemodVersionCreateNestedManyWithoutCodemodInputSchema: z.ZodType<Prisma.CodemodVersionCreateNestedManyWithoutCodemodInput> = z.object({
  create: z.union([ z.lazy(() => CodemodVersionCreateWithoutCodemodInputSchema),z.lazy(() => CodemodVersionCreateWithoutCodemodInputSchema).array(),z.lazy(() => CodemodVersionUncheckedCreateWithoutCodemodInputSchema),z.lazy(() => CodemodVersionUncheckedCreateWithoutCodemodInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CodemodVersionCreateOrConnectWithoutCodemodInputSchema),z.lazy(() => CodemodVersionCreateOrConnectWithoutCodemodInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CodemodVersionCreateManyCodemodInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CodemodVersionWhereUniqueInputSchema),z.lazy(() => CodemodVersionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const CodemodVersionUncheckedCreateNestedManyWithoutCodemodInputSchema: z.ZodType<Prisma.CodemodVersionUncheckedCreateNestedManyWithoutCodemodInput> = z.object({
  create: z.union([ z.lazy(() => CodemodVersionCreateWithoutCodemodInputSchema),z.lazy(() => CodemodVersionCreateWithoutCodemodInputSchema).array(),z.lazy(() => CodemodVersionUncheckedCreateWithoutCodemodInputSchema),z.lazy(() => CodemodVersionUncheckedCreateWithoutCodemodInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CodemodVersionCreateOrConnectWithoutCodemodInputSchema),z.lazy(() => CodemodVersionCreateOrConnectWithoutCodemodInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CodemodVersionCreateManyCodemodInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CodemodVersionWhereUniqueInputSchema),z.lazy(() => CodemodVersionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const CodemodUpdatetagsInputSchema: z.ZodType<Prisma.CodemodUpdatetagsInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const CodemodUpdatelabelsInputSchema: z.ZodType<Prisma.CodemodUpdatelabelsInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const CodemodVersionUpdateManyWithoutCodemodNestedInputSchema: z.ZodType<Prisma.CodemodVersionUpdateManyWithoutCodemodNestedInput> = z.object({
  create: z.union([ z.lazy(() => CodemodVersionCreateWithoutCodemodInputSchema),z.lazy(() => CodemodVersionCreateWithoutCodemodInputSchema).array(),z.lazy(() => CodemodVersionUncheckedCreateWithoutCodemodInputSchema),z.lazy(() => CodemodVersionUncheckedCreateWithoutCodemodInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CodemodVersionCreateOrConnectWithoutCodemodInputSchema),z.lazy(() => CodemodVersionCreateOrConnectWithoutCodemodInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CodemodVersionUpsertWithWhereUniqueWithoutCodemodInputSchema),z.lazy(() => CodemodVersionUpsertWithWhereUniqueWithoutCodemodInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CodemodVersionCreateManyCodemodInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CodemodVersionWhereUniqueInputSchema),z.lazy(() => CodemodVersionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CodemodVersionWhereUniqueInputSchema),z.lazy(() => CodemodVersionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CodemodVersionWhereUniqueInputSchema),z.lazy(() => CodemodVersionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CodemodVersionWhereUniqueInputSchema),z.lazy(() => CodemodVersionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CodemodVersionUpdateWithWhereUniqueWithoutCodemodInputSchema),z.lazy(() => CodemodVersionUpdateWithWhereUniqueWithoutCodemodInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CodemodVersionUpdateManyWithWhereWithoutCodemodInputSchema),z.lazy(() => CodemodVersionUpdateManyWithWhereWithoutCodemodInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CodemodVersionScalarWhereInputSchema),z.lazy(() => CodemodVersionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const CodemodVersionUncheckedUpdateManyWithoutCodemodNestedInputSchema: z.ZodType<Prisma.CodemodVersionUncheckedUpdateManyWithoutCodemodNestedInput> = z.object({
  create: z.union([ z.lazy(() => CodemodVersionCreateWithoutCodemodInputSchema),z.lazy(() => CodemodVersionCreateWithoutCodemodInputSchema).array(),z.lazy(() => CodemodVersionUncheckedCreateWithoutCodemodInputSchema),z.lazy(() => CodemodVersionUncheckedCreateWithoutCodemodInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CodemodVersionCreateOrConnectWithoutCodemodInputSchema),z.lazy(() => CodemodVersionCreateOrConnectWithoutCodemodInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CodemodVersionUpsertWithWhereUniqueWithoutCodemodInputSchema),z.lazy(() => CodemodVersionUpsertWithWhereUniqueWithoutCodemodInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CodemodVersionCreateManyCodemodInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CodemodVersionWhereUniqueInputSchema),z.lazy(() => CodemodVersionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CodemodVersionWhereUniqueInputSchema),z.lazy(() => CodemodVersionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CodemodVersionWhereUniqueInputSchema),z.lazy(() => CodemodVersionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CodemodVersionWhereUniqueInputSchema),z.lazy(() => CodemodVersionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CodemodVersionUpdateWithWhereUniqueWithoutCodemodInputSchema),z.lazy(() => CodemodVersionUpdateWithWhereUniqueWithoutCodemodInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CodemodVersionUpdateManyWithWhereWithoutCodemodInputSchema),z.lazy(() => CodemodVersionUpdateManyWithWhereWithoutCodemodInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CodemodVersionScalarWhereInputSchema),z.lazy(() => CodemodVersionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const CodemodVersionCreatetagsInputSchema: z.ZodType<Prisma.CodemodVersionCreatetagsInput> = z.object({
  set: z.string().array()
}).strict();

export const CodemodCreateNestedOneWithoutVersionsInputSchema: z.ZodType<Prisma.CodemodCreateNestedOneWithoutVersionsInput> = z.object({
  create: z.union([ z.lazy(() => CodemodCreateWithoutVersionsInputSchema),z.lazy(() => CodemodUncheckedCreateWithoutVersionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CodemodCreateOrConnectWithoutVersionsInputSchema).optional(),
  connect: z.lazy(() => CodemodWhereUniqueInputSchema).optional()
}).strict();

export const CodemodVersionUpdatetagsInputSchema: z.ZodType<Prisma.CodemodVersionUpdatetagsInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export const CodemodUpdateOneRequiredWithoutVersionsNestedInputSchema: z.ZodType<Prisma.CodemodUpdateOneRequiredWithoutVersionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => CodemodCreateWithoutVersionsInputSchema),z.lazy(() => CodemodUncheckedCreateWithoutVersionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CodemodCreateOrConnectWithoutVersionsInputSchema).optional(),
  upsert: z.lazy(() => CodemodUpsertWithoutVersionsInputSchema).optional(),
  connect: z.lazy(() => CodemodWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CodemodUpdateToOneWithWhereWithoutVersionsInputSchema),z.lazy(() => CodemodUpdateWithoutVersionsInputSchema),z.lazy(() => CodemodUncheckedUpdateWithoutVersionsInputSchema) ]).optional(),
}).strict();

export const TagCreatealiasesInputSchema: z.ZodType<Prisma.TagCreatealiasesInput> = z.object({
  set: z.string().array()
}).strict();

export const TagUpdatealiasesInputSchema: z.ZodType<Prisma.TagUpdatealiasesInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export const BigIntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BigIntFieldUpdateOperationsInput> = z.object({
  set: z.bigint().optional(),
  increment: z.bigint().optional(),
  decrement: z.bigint().optional(),
  multiply: z.bigint().optional(),
  divide: z.bigint().optional()
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
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
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
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
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
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
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
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
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedJsonNullableFilterSchema: z.ZodType<Prisma.NestedJsonNullableFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional()
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedBigIntFilterSchema: z.ZodType<Prisma.NestedBigIntFilter> = z.object({
  equals: z.bigint().optional(),
  in: z.bigint().array().optional(),
  notIn: z.bigint().array().optional(),
  lt: z.bigint().optional(),
  lte: z.bigint().optional(),
  gt: z.bigint().optional(),
  gte: z.bigint().optional(),
  not: z.union([ z.bigint(),z.lazy(() => NestedBigIntFilterSchema) ]).optional(),
}).strict();

export const NestedBigIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBigIntWithAggregatesFilter> = z.object({
  equals: z.bigint().optional(),
  in: z.bigint().array().optional(),
  notIn: z.bigint().array().optional(),
  lt: z.bigint().optional(),
  lte: z.bigint().optional(),
  gt: z.bigint().optional(),
  gte: z.bigint().optional(),
  not: z.union([ z.bigint(),z.lazy(() => NestedBigIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedBigIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBigIntFilterSchema).optional(),
  _max: z.lazy(() => NestedBigIntFilterSchema).optional()
}).strict();

export const NestedUuidFilterSchema: z.ZodType<Prisma.NestedUuidFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidFilterSchema) ]).optional(),
}).strict();

export const NestedUuidWithAggregatesFilterSchema: z.ZodType<Prisma.NestedUuidWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const CodemodVersionCreateWithoutCodemodInputSchema: z.ZodType<Prisma.CodemodVersionCreateWithoutCodemodInput> = z.object({
  version: z.string(),
  shortDescription: z.string().optional().nullable(),
  engine: z.string(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  vsCodeLink: z.string(),
  codemodStudioExampleLink: z.string().optional().nullable(),
  testProjectCommand: z.string().optional().nullable(),
  sourceRepo: z.string().optional().nullable(),
  amountOfUses: z.number().int().optional(),
  totalTimeSaved: z.number().int().optional(),
  openedPrs: z.number().int().optional(),
  s3Bucket: z.string(),
  s3UploadKey: z.string(),
  tags: z.union([ z.lazy(() => CodemodVersionCreatetagsInputSchema),z.string().array() ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const CodemodVersionUncheckedCreateWithoutCodemodInputSchema: z.ZodType<Prisma.CodemodVersionUncheckedCreateWithoutCodemodInput> = z.object({
  id: z.number().int().optional(),
  version: z.string(),
  shortDescription: z.string().optional().nullable(),
  engine: z.string(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  vsCodeLink: z.string(),
  codemodStudioExampleLink: z.string().optional().nullable(),
  testProjectCommand: z.string().optional().nullable(),
  sourceRepo: z.string().optional().nullable(),
  amountOfUses: z.number().int().optional(),
  totalTimeSaved: z.number().int().optional(),
  openedPrs: z.number().int().optional(),
  s3Bucket: z.string(),
  s3UploadKey: z.string(),
  tags: z.union([ z.lazy(() => CodemodVersionCreatetagsInputSchema),z.string().array() ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const CodemodVersionCreateOrConnectWithoutCodemodInputSchema: z.ZodType<Prisma.CodemodVersionCreateOrConnectWithoutCodemodInput> = z.object({
  where: z.lazy(() => CodemodVersionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CodemodVersionCreateWithoutCodemodInputSchema),z.lazy(() => CodemodVersionUncheckedCreateWithoutCodemodInputSchema) ]),
}).strict();

export const CodemodVersionCreateManyCodemodInputEnvelopeSchema: z.ZodType<Prisma.CodemodVersionCreateManyCodemodInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CodemodVersionCreateManyCodemodInputSchema),z.lazy(() => CodemodVersionCreateManyCodemodInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const CodemodVersionUpsertWithWhereUniqueWithoutCodemodInputSchema: z.ZodType<Prisma.CodemodVersionUpsertWithWhereUniqueWithoutCodemodInput> = z.object({
  where: z.lazy(() => CodemodVersionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CodemodVersionUpdateWithoutCodemodInputSchema),z.lazy(() => CodemodVersionUncheckedUpdateWithoutCodemodInputSchema) ]),
  create: z.union([ z.lazy(() => CodemodVersionCreateWithoutCodemodInputSchema),z.lazy(() => CodemodVersionUncheckedCreateWithoutCodemodInputSchema) ]),
}).strict();

export const CodemodVersionUpdateWithWhereUniqueWithoutCodemodInputSchema: z.ZodType<Prisma.CodemodVersionUpdateWithWhereUniqueWithoutCodemodInput> = z.object({
  where: z.lazy(() => CodemodVersionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CodemodVersionUpdateWithoutCodemodInputSchema),z.lazy(() => CodemodVersionUncheckedUpdateWithoutCodemodInputSchema) ]),
}).strict();

export const CodemodVersionUpdateManyWithWhereWithoutCodemodInputSchema: z.ZodType<Prisma.CodemodVersionUpdateManyWithWhereWithoutCodemodInput> = z.object({
  where: z.lazy(() => CodemodVersionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CodemodVersionUpdateManyMutationInputSchema),z.lazy(() => CodemodVersionUncheckedUpdateManyWithoutCodemodInputSchema) ]),
}).strict();

export const CodemodVersionScalarWhereInputSchema: z.ZodType<Prisma.CodemodVersionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => CodemodVersionScalarWhereInputSchema),z.lazy(() => CodemodVersionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CodemodVersionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CodemodVersionScalarWhereInputSchema),z.lazy(() => CodemodVersionScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  version: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  shortDescription: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  engine: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  applicability: z.lazy(() => JsonNullableFilterSchema).optional(),
  arguments: z.lazy(() => JsonNullableFilterSchema).optional(),
  vsCodeLink: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  codemodStudioExampleLink: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  testProjectCommand: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  sourceRepo: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  amountOfUses: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  totalTimeSaved: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  openedPrs: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  s3Bucket: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  s3UploadKey: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  tags: z.lazy(() => StringNullableListFilterSchema).optional(),
  codemodId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const CodemodCreateWithoutVersionsInputSchema: z.ZodType<Prisma.CodemodCreateWithoutVersionsInput> = z.object({
  slug: z.string(),
  shortDescription: z.string().optional().nullable(),
  tags: z.union([ z.lazy(() => CodemodCreatetagsInputSchema),z.string().array() ]).optional(),
  engine: z.string().optional().nullable(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  name: z.string(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  private: z.boolean(),
  author: z.string(),
  amountOfUses: z.number().int().optional(),
  totalTimeSaved: z.number().int().optional(),
  openedPrs: z.number().int().optional(),
  labels: z.union([ z.lazy(() => CodemodCreatelabelsInputSchema),z.string().array() ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const CodemodUncheckedCreateWithoutVersionsInputSchema: z.ZodType<Prisma.CodemodUncheckedCreateWithoutVersionsInput> = z.object({
  id: z.number().int().optional(),
  slug: z.string(),
  shortDescription: z.string().optional().nullable(),
  tags: z.union([ z.lazy(() => CodemodCreatetagsInputSchema),z.string().array() ]).optional(),
  engine: z.string().optional().nullable(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  name: z.string(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  private: z.boolean(),
  author: z.string(),
  amountOfUses: z.number().int().optional(),
  totalTimeSaved: z.number().int().optional(),
  openedPrs: z.number().int().optional(),
  labels: z.union([ z.lazy(() => CodemodCreatelabelsInputSchema),z.string().array() ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const CodemodCreateOrConnectWithoutVersionsInputSchema: z.ZodType<Prisma.CodemodCreateOrConnectWithoutVersionsInput> = z.object({
  where: z.lazy(() => CodemodWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CodemodCreateWithoutVersionsInputSchema),z.lazy(() => CodemodUncheckedCreateWithoutVersionsInputSchema) ]),
}).strict();

export const CodemodUpsertWithoutVersionsInputSchema: z.ZodType<Prisma.CodemodUpsertWithoutVersionsInput> = z.object({
  update: z.union([ z.lazy(() => CodemodUpdateWithoutVersionsInputSchema),z.lazy(() => CodemodUncheckedUpdateWithoutVersionsInputSchema) ]),
  create: z.union([ z.lazy(() => CodemodCreateWithoutVersionsInputSchema),z.lazy(() => CodemodUncheckedCreateWithoutVersionsInputSchema) ]),
  where: z.lazy(() => CodemodWhereInputSchema).optional()
}).strict();

export const CodemodUpdateToOneWithWhereWithoutVersionsInputSchema: z.ZodType<Prisma.CodemodUpdateToOneWithWhereWithoutVersionsInput> = z.object({
  where: z.lazy(() => CodemodWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CodemodUpdateWithoutVersionsInputSchema),z.lazy(() => CodemodUncheckedUpdateWithoutVersionsInputSchema) ]),
}).strict();

export const CodemodUpdateWithoutVersionsInputSchema: z.ZodType<Prisma.CodemodUpdateWithoutVersionsInput> = z.object({
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDescription: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => CodemodUpdatetagsInputSchema),z.string().array() ]).optional(),
  engine: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  featured: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  private: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  author: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amountOfUses: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTimeSaved: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  openedPrs: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  labels: z.union([ z.lazy(() => CodemodUpdatelabelsInputSchema),z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CodemodUncheckedUpdateWithoutVersionsInputSchema: z.ZodType<Prisma.CodemodUncheckedUpdateWithoutVersionsInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDescription: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => CodemodUpdatetagsInputSchema),z.string().array() ]).optional(),
  engine: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  featured: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  private: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  author: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amountOfUses: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTimeSaved: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  openedPrs: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  labels: z.union([ z.lazy(() => CodemodUpdatelabelsInputSchema),z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CodemodVersionCreateManyCodemodInputSchema: z.ZodType<Prisma.CodemodVersionCreateManyCodemodInput> = z.object({
  id: z.number().int().optional(),
  version: z.string(),
  shortDescription: z.string().optional().nullable(),
  engine: z.string(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  vsCodeLink: z.string(),
  codemodStudioExampleLink: z.string().optional().nullable(),
  testProjectCommand: z.string().optional().nullable(),
  sourceRepo: z.string().optional().nullable(),
  amountOfUses: z.number().int().optional(),
  totalTimeSaved: z.number().int().optional(),
  openedPrs: z.number().int().optional(),
  s3Bucket: z.string(),
  s3UploadKey: z.string(),
  tags: z.union([ z.lazy(() => CodemodVersionCreatetagsInputSchema),z.string().array() ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const CodemodVersionUpdateWithoutCodemodInputSchema: z.ZodType<Prisma.CodemodVersionUpdateWithoutCodemodInput> = z.object({
  version: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDescription: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  engine: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  vsCodeLink: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  codemodStudioExampleLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  testProjectCommand: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sourceRepo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amountOfUses: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTimeSaved: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  openedPrs: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  s3Bucket: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  s3UploadKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  tags: z.union([ z.lazy(() => CodemodVersionUpdatetagsInputSchema),z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CodemodVersionUncheckedUpdateWithoutCodemodInputSchema: z.ZodType<Prisma.CodemodVersionUncheckedUpdateWithoutCodemodInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  version: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDescription: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  engine: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  vsCodeLink: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  codemodStudioExampleLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  testProjectCommand: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sourceRepo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amountOfUses: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTimeSaved: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  openedPrs: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  s3Bucket: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  s3UploadKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  tags: z.union([ z.lazy(() => CodemodVersionUpdatetagsInputSchema),z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const CodemodVersionUncheckedUpdateManyWithoutCodemodInputSchema: z.ZodType<Prisma.CodemodVersionUncheckedUpdateManyWithoutCodemodInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  version: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDescription: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  engine: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  applicability: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  arguments: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  vsCodeLink: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  codemodStudioExampleLink: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  testProjectCommand: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sourceRepo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amountOfUses: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTimeSaved: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  openedPrs: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  s3Bucket: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  s3UploadKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  tags: z.union([ z.lazy(() => CodemodVersionUpdatetagsInputSchema),z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const CodemodFindFirstArgsSchema: z.ZodType<Prisma.CodemodFindFirstArgs> = z.object({
  select: CodemodSelectSchema.optional(),
  include: CodemodIncludeSchema.optional(),
  where: CodemodWhereInputSchema.optional(),
  orderBy: z.union([ CodemodOrderByWithRelationInputSchema.array(),CodemodOrderByWithRelationInputSchema ]).optional(),
  cursor: CodemodWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CodemodScalarFieldEnumSchema,CodemodScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const CodemodFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CodemodFindFirstOrThrowArgs> = z.object({
  select: CodemodSelectSchema.optional(),
  include: CodemodIncludeSchema.optional(),
  where: CodemodWhereInputSchema.optional(),
  orderBy: z.union([ CodemodOrderByWithRelationInputSchema.array(),CodemodOrderByWithRelationInputSchema ]).optional(),
  cursor: CodemodWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CodemodScalarFieldEnumSchema,CodemodScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const CodemodFindManyArgsSchema: z.ZodType<Prisma.CodemodFindManyArgs> = z.object({
  select: CodemodSelectSchema.optional(),
  include: CodemodIncludeSchema.optional(),
  where: CodemodWhereInputSchema.optional(),
  orderBy: z.union([ CodemodOrderByWithRelationInputSchema.array(),CodemodOrderByWithRelationInputSchema ]).optional(),
  cursor: CodemodWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CodemodScalarFieldEnumSchema,CodemodScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const CodemodAggregateArgsSchema: z.ZodType<Prisma.CodemodAggregateArgs> = z.object({
  where: CodemodWhereInputSchema.optional(),
  orderBy: z.union([ CodemodOrderByWithRelationInputSchema.array(),CodemodOrderByWithRelationInputSchema ]).optional(),
  cursor: CodemodWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const CodemodGroupByArgsSchema: z.ZodType<Prisma.CodemodGroupByArgs> = z.object({
  where: CodemodWhereInputSchema.optional(),
  orderBy: z.union([ CodemodOrderByWithAggregationInputSchema.array(),CodemodOrderByWithAggregationInputSchema ]).optional(),
  by: CodemodScalarFieldEnumSchema.array(),
  having: CodemodScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const CodemodFindUniqueArgsSchema: z.ZodType<Prisma.CodemodFindUniqueArgs> = z.object({
  select: CodemodSelectSchema.optional(),
  include: CodemodIncludeSchema.optional(),
  where: CodemodWhereUniqueInputSchema,
}).strict() ;

export const CodemodFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CodemodFindUniqueOrThrowArgs> = z.object({
  select: CodemodSelectSchema.optional(),
  include: CodemodIncludeSchema.optional(),
  where: CodemodWhereUniqueInputSchema,
}).strict() ;

export const CodemodVersionFindFirstArgsSchema: z.ZodType<Prisma.CodemodVersionFindFirstArgs> = z.object({
  select: CodemodVersionSelectSchema.optional(),
  include: CodemodVersionIncludeSchema.optional(),
  where: CodemodVersionWhereInputSchema.optional(),
  orderBy: z.union([ CodemodVersionOrderByWithRelationInputSchema.array(),CodemodVersionOrderByWithRelationInputSchema ]).optional(),
  cursor: CodemodVersionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CodemodVersionScalarFieldEnumSchema,CodemodVersionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const CodemodVersionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CodemodVersionFindFirstOrThrowArgs> = z.object({
  select: CodemodVersionSelectSchema.optional(),
  include: CodemodVersionIncludeSchema.optional(),
  where: CodemodVersionWhereInputSchema.optional(),
  orderBy: z.union([ CodemodVersionOrderByWithRelationInputSchema.array(),CodemodVersionOrderByWithRelationInputSchema ]).optional(),
  cursor: CodemodVersionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CodemodVersionScalarFieldEnumSchema,CodemodVersionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const CodemodVersionFindManyArgsSchema: z.ZodType<Prisma.CodemodVersionFindManyArgs> = z.object({
  select: CodemodVersionSelectSchema.optional(),
  include: CodemodVersionIncludeSchema.optional(),
  where: CodemodVersionWhereInputSchema.optional(),
  orderBy: z.union([ CodemodVersionOrderByWithRelationInputSchema.array(),CodemodVersionOrderByWithRelationInputSchema ]).optional(),
  cursor: CodemodVersionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CodemodVersionScalarFieldEnumSchema,CodemodVersionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const CodemodVersionAggregateArgsSchema: z.ZodType<Prisma.CodemodVersionAggregateArgs> = z.object({
  where: CodemodVersionWhereInputSchema.optional(),
  orderBy: z.union([ CodemodVersionOrderByWithRelationInputSchema.array(),CodemodVersionOrderByWithRelationInputSchema ]).optional(),
  cursor: CodemodVersionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const CodemodVersionGroupByArgsSchema: z.ZodType<Prisma.CodemodVersionGroupByArgs> = z.object({
  where: CodemodVersionWhereInputSchema.optional(),
  orderBy: z.union([ CodemodVersionOrderByWithAggregationInputSchema.array(),CodemodVersionOrderByWithAggregationInputSchema ]).optional(),
  by: CodemodVersionScalarFieldEnumSchema.array(),
  having: CodemodVersionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const CodemodVersionFindUniqueArgsSchema: z.ZodType<Prisma.CodemodVersionFindUniqueArgs> = z.object({
  select: CodemodVersionSelectSchema.optional(),
  include: CodemodVersionIncludeSchema.optional(),
  where: CodemodVersionWhereUniqueInputSchema,
}).strict() ;

export const CodemodVersionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CodemodVersionFindUniqueOrThrowArgs> = z.object({
  select: CodemodVersionSelectSchema.optional(),
  include: CodemodVersionIncludeSchema.optional(),
  where: CodemodVersionWhereUniqueInputSchema,
}).strict() ;

export const TagFindFirstArgsSchema: z.ZodType<Prisma.TagFindFirstArgs> = z.object({
  select: TagSelectSchema.optional(),
  where: TagWhereInputSchema.optional(),
  orderBy: z.union([ TagOrderByWithRelationInputSchema.array(),TagOrderByWithRelationInputSchema ]).optional(),
  cursor: TagWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TagScalarFieldEnumSchema,TagScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TagFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TagFindFirstOrThrowArgs> = z.object({
  select: TagSelectSchema.optional(),
  where: TagWhereInputSchema.optional(),
  orderBy: z.union([ TagOrderByWithRelationInputSchema.array(),TagOrderByWithRelationInputSchema ]).optional(),
  cursor: TagWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TagScalarFieldEnumSchema,TagScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TagFindManyArgsSchema: z.ZodType<Prisma.TagFindManyArgs> = z.object({
  select: TagSelectSchema.optional(),
  where: TagWhereInputSchema.optional(),
  orderBy: z.union([ TagOrderByWithRelationInputSchema.array(),TagOrderByWithRelationInputSchema ]).optional(),
  cursor: TagWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TagScalarFieldEnumSchema,TagScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TagAggregateArgsSchema: z.ZodType<Prisma.TagAggregateArgs> = z.object({
  where: TagWhereInputSchema.optional(),
  orderBy: z.union([ TagOrderByWithRelationInputSchema.array(),TagOrderByWithRelationInputSchema ]).optional(),
  cursor: TagWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TagGroupByArgsSchema: z.ZodType<Prisma.TagGroupByArgs> = z.object({
  where: TagWhereInputSchema.optional(),
  orderBy: z.union([ TagOrderByWithAggregationInputSchema.array(),TagOrderByWithAggregationInputSchema ]).optional(),
  by: TagScalarFieldEnumSchema.array(),
  having: TagScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TagFindUniqueArgsSchema: z.ZodType<Prisma.TagFindUniqueArgs> = z.object({
  select: TagSelectSchema.optional(),
  where: TagWhereUniqueInputSchema,
}).strict() ;

export const TagFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TagFindUniqueOrThrowArgs> = z.object({
  select: TagSelectSchema.optional(),
  where: TagWhereUniqueInputSchema,
}).strict() ;

export const TokenMetadataFindFirstArgsSchema: z.ZodType<Prisma.TokenMetadataFindFirstArgs> = z.object({
  select: TokenMetadataSelectSchema.optional(),
  where: TokenMetadataWhereInputSchema.optional(),
  orderBy: z.union([ TokenMetadataOrderByWithRelationInputSchema.array(),TokenMetadataOrderByWithRelationInputSchema ]).optional(),
  cursor: TokenMetadataWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TokenMetadataScalarFieldEnumSchema,TokenMetadataScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TokenMetadataFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TokenMetadataFindFirstOrThrowArgs> = z.object({
  select: TokenMetadataSelectSchema.optional(),
  where: TokenMetadataWhereInputSchema.optional(),
  orderBy: z.union([ TokenMetadataOrderByWithRelationInputSchema.array(),TokenMetadataOrderByWithRelationInputSchema ]).optional(),
  cursor: TokenMetadataWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TokenMetadataScalarFieldEnumSchema,TokenMetadataScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TokenMetadataFindManyArgsSchema: z.ZodType<Prisma.TokenMetadataFindManyArgs> = z.object({
  select: TokenMetadataSelectSchema.optional(),
  where: TokenMetadataWhereInputSchema.optional(),
  orderBy: z.union([ TokenMetadataOrderByWithRelationInputSchema.array(),TokenMetadataOrderByWithRelationInputSchema ]).optional(),
  cursor: TokenMetadataWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TokenMetadataScalarFieldEnumSchema,TokenMetadataScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TokenMetadataAggregateArgsSchema: z.ZodType<Prisma.TokenMetadataAggregateArgs> = z.object({
  where: TokenMetadataWhereInputSchema.optional(),
  orderBy: z.union([ TokenMetadataOrderByWithRelationInputSchema.array(),TokenMetadataOrderByWithRelationInputSchema ]).optional(),
  cursor: TokenMetadataWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TokenMetadataGroupByArgsSchema: z.ZodType<Prisma.TokenMetadataGroupByArgs> = z.object({
  where: TokenMetadataWhereInputSchema.optional(),
  orderBy: z.union([ TokenMetadataOrderByWithAggregationInputSchema.array(),TokenMetadataOrderByWithAggregationInputSchema ]).optional(),
  by: TokenMetadataScalarFieldEnumSchema.array(),
  having: TokenMetadataScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TokenMetadataFindUniqueArgsSchema: z.ZodType<Prisma.TokenMetadataFindUniqueArgs> = z.object({
  select: TokenMetadataSelectSchema.optional(),
  where: TokenMetadataWhereUniqueInputSchema,
}).strict() ;

export const TokenMetadataFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TokenMetadataFindUniqueOrThrowArgs> = z.object({
  select: TokenMetadataSelectSchema.optional(),
  where: TokenMetadataWhereUniqueInputSchema,
}).strict() ;

export const UserLoginIntentFindFirstArgsSchema: z.ZodType<Prisma.UserLoginIntentFindFirstArgs> = z.object({
  select: UserLoginIntentSelectSchema.optional(),
  where: UserLoginIntentWhereInputSchema.optional(),
  orderBy: z.union([ UserLoginIntentOrderByWithRelationInputSchema.array(),UserLoginIntentOrderByWithRelationInputSchema ]).optional(),
  cursor: UserLoginIntentWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserLoginIntentScalarFieldEnumSchema,UserLoginIntentScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserLoginIntentFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserLoginIntentFindFirstOrThrowArgs> = z.object({
  select: UserLoginIntentSelectSchema.optional(),
  where: UserLoginIntentWhereInputSchema.optional(),
  orderBy: z.union([ UserLoginIntentOrderByWithRelationInputSchema.array(),UserLoginIntentOrderByWithRelationInputSchema ]).optional(),
  cursor: UserLoginIntentWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserLoginIntentScalarFieldEnumSchema,UserLoginIntentScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserLoginIntentFindManyArgsSchema: z.ZodType<Prisma.UserLoginIntentFindManyArgs> = z.object({
  select: UserLoginIntentSelectSchema.optional(),
  where: UserLoginIntentWhereInputSchema.optional(),
  orderBy: z.union([ UserLoginIntentOrderByWithRelationInputSchema.array(),UserLoginIntentOrderByWithRelationInputSchema ]).optional(),
  cursor: UserLoginIntentWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserLoginIntentScalarFieldEnumSchema,UserLoginIntentScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserLoginIntentAggregateArgsSchema: z.ZodType<Prisma.UserLoginIntentAggregateArgs> = z.object({
  where: UserLoginIntentWhereInputSchema.optional(),
  orderBy: z.union([ UserLoginIntentOrderByWithRelationInputSchema.array(),UserLoginIntentOrderByWithRelationInputSchema ]).optional(),
  cursor: UserLoginIntentWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserLoginIntentGroupByArgsSchema: z.ZodType<Prisma.UserLoginIntentGroupByArgs> = z.object({
  where: UserLoginIntentWhereInputSchema.optional(),
  orderBy: z.union([ UserLoginIntentOrderByWithAggregationInputSchema.array(),UserLoginIntentOrderByWithAggregationInputSchema ]).optional(),
  by: UserLoginIntentScalarFieldEnumSchema.array(),
  having: UserLoginIntentScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserLoginIntentFindUniqueArgsSchema: z.ZodType<Prisma.UserLoginIntentFindUniqueArgs> = z.object({
  select: UserLoginIntentSelectSchema.optional(),
  where: UserLoginIntentWhereUniqueInputSchema,
}).strict() ;

export const UserLoginIntentFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserLoginIntentFindUniqueOrThrowArgs> = z.object({
  select: UserLoginIntentSelectSchema.optional(),
  where: UserLoginIntentWhereUniqueInputSchema,
}).strict() ;

export const TokenRevocationFindFirstArgsSchema: z.ZodType<Prisma.TokenRevocationFindFirstArgs> = z.object({
  select: TokenRevocationSelectSchema.optional(),
  where: TokenRevocationWhereInputSchema.optional(),
  orderBy: z.union([ TokenRevocationOrderByWithRelationInputSchema.array(),TokenRevocationOrderByWithRelationInputSchema ]).optional(),
  cursor: TokenRevocationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TokenRevocationScalarFieldEnumSchema,TokenRevocationScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TokenRevocationFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TokenRevocationFindFirstOrThrowArgs> = z.object({
  select: TokenRevocationSelectSchema.optional(),
  where: TokenRevocationWhereInputSchema.optional(),
  orderBy: z.union([ TokenRevocationOrderByWithRelationInputSchema.array(),TokenRevocationOrderByWithRelationInputSchema ]).optional(),
  cursor: TokenRevocationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TokenRevocationScalarFieldEnumSchema,TokenRevocationScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TokenRevocationFindManyArgsSchema: z.ZodType<Prisma.TokenRevocationFindManyArgs> = z.object({
  select: TokenRevocationSelectSchema.optional(),
  where: TokenRevocationWhereInputSchema.optional(),
  orderBy: z.union([ TokenRevocationOrderByWithRelationInputSchema.array(),TokenRevocationOrderByWithRelationInputSchema ]).optional(),
  cursor: TokenRevocationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TokenRevocationScalarFieldEnumSchema,TokenRevocationScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const TokenRevocationAggregateArgsSchema: z.ZodType<Prisma.TokenRevocationAggregateArgs> = z.object({
  where: TokenRevocationWhereInputSchema.optional(),
  orderBy: z.union([ TokenRevocationOrderByWithRelationInputSchema.array(),TokenRevocationOrderByWithRelationInputSchema ]).optional(),
  cursor: TokenRevocationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TokenRevocationGroupByArgsSchema: z.ZodType<Prisma.TokenRevocationGroupByArgs> = z.object({
  where: TokenRevocationWhereInputSchema.optional(),
  orderBy: z.union([ TokenRevocationOrderByWithAggregationInputSchema.array(),TokenRevocationOrderByWithAggregationInputSchema ]).optional(),
  by: TokenRevocationScalarFieldEnumSchema.array(),
  having: TokenRevocationScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TokenRevocationFindUniqueArgsSchema: z.ZodType<Prisma.TokenRevocationFindUniqueArgs> = z.object({
  select: TokenRevocationSelectSchema.optional(),
  where: TokenRevocationWhereUniqueInputSchema,
}).strict() ;

export const TokenRevocationFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TokenRevocationFindUniqueOrThrowArgs> = z.object({
  select: TokenRevocationSelectSchema.optional(),
  where: TokenRevocationWhereUniqueInputSchema,
}).strict() ;

export const CodeDiffFindFirstArgsSchema: z.ZodType<Prisma.CodeDiffFindFirstArgs> = z.object({
  select: CodeDiffSelectSchema.optional(),
  where: CodeDiffWhereInputSchema.optional(),
  orderBy: z.union([ CodeDiffOrderByWithRelationInputSchema.array(),CodeDiffOrderByWithRelationInputSchema ]).optional(),
  cursor: CodeDiffWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CodeDiffScalarFieldEnumSchema,CodeDiffScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const CodeDiffFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CodeDiffFindFirstOrThrowArgs> = z.object({
  select: CodeDiffSelectSchema.optional(),
  where: CodeDiffWhereInputSchema.optional(),
  orderBy: z.union([ CodeDiffOrderByWithRelationInputSchema.array(),CodeDiffOrderByWithRelationInputSchema ]).optional(),
  cursor: CodeDiffWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CodeDiffScalarFieldEnumSchema,CodeDiffScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const CodeDiffFindManyArgsSchema: z.ZodType<Prisma.CodeDiffFindManyArgs> = z.object({
  select: CodeDiffSelectSchema.optional(),
  where: CodeDiffWhereInputSchema.optional(),
  orderBy: z.union([ CodeDiffOrderByWithRelationInputSchema.array(),CodeDiffOrderByWithRelationInputSchema ]).optional(),
  cursor: CodeDiffWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CodeDiffScalarFieldEnumSchema,CodeDiffScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const CodeDiffAggregateArgsSchema: z.ZodType<Prisma.CodeDiffAggregateArgs> = z.object({
  where: CodeDiffWhereInputSchema.optional(),
  orderBy: z.union([ CodeDiffOrderByWithRelationInputSchema.array(),CodeDiffOrderByWithRelationInputSchema ]).optional(),
  cursor: CodeDiffWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const CodeDiffGroupByArgsSchema: z.ZodType<Prisma.CodeDiffGroupByArgs> = z.object({
  where: CodeDiffWhereInputSchema.optional(),
  orderBy: z.union([ CodeDiffOrderByWithAggregationInputSchema.array(),CodeDiffOrderByWithAggregationInputSchema ]).optional(),
  by: CodeDiffScalarFieldEnumSchema.array(),
  having: CodeDiffScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const CodeDiffFindUniqueArgsSchema: z.ZodType<Prisma.CodeDiffFindUniqueArgs> = z.object({
  select: CodeDiffSelectSchema.optional(),
  where: CodeDiffWhereUniqueInputSchema,
}).strict() ;

export const CodeDiffFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CodeDiffFindUniqueOrThrowArgs> = z.object({
  select: CodeDiffSelectSchema.optional(),
  where: CodeDiffWhereUniqueInputSchema,
}).strict() ;

export const CodemodCreateArgsSchema: z.ZodType<Prisma.CodemodCreateArgs> = z.object({
  select: CodemodSelectSchema.optional(),
  include: CodemodIncludeSchema.optional(),
  data: z.union([ CodemodCreateInputSchema,CodemodUncheckedCreateInputSchema ]),
}).strict() ;

export const CodemodUpsertArgsSchema: z.ZodType<Prisma.CodemodUpsertArgs> = z.object({
  select: CodemodSelectSchema.optional(),
  include: CodemodIncludeSchema.optional(),
  where: CodemodWhereUniqueInputSchema,
  create: z.union([ CodemodCreateInputSchema,CodemodUncheckedCreateInputSchema ]),
  update: z.union([ CodemodUpdateInputSchema,CodemodUncheckedUpdateInputSchema ]),
}).strict() ;

export const CodemodCreateManyArgsSchema: z.ZodType<Prisma.CodemodCreateManyArgs> = z.object({
  data: z.union([ CodemodCreateManyInputSchema,CodemodCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const CodemodDeleteArgsSchema: z.ZodType<Prisma.CodemodDeleteArgs> = z.object({
  select: CodemodSelectSchema.optional(),
  include: CodemodIncludeSchema.optional(),
  where: CodemodWhereUniqueInputSchema,
}).strict() ;

export const CodemodUpdateArgsSchema: z.ZodType<Prisma.CodemodUpdateArgs> = z.object({
  select: CodemodSelectSchema.optional(),
  include: CodemodIncludeSchema.optional(),
  data: z.union([ CodemodUpdateInputSchema,CodemodUncheckedUpdateInputSchema ]),
  where: CodemodWhereUniqueInputSchema,
}).strict() ;

export const CodemodUpdateManyArgsSchema: z.ZodType<Prisma.CodemodUpdateManyArgs> = z.object({
  data: z.union([ CodemodUpdateManyMutationInputSchema,CodemodUncheckedUpdateManyInputSchema ]),
  where: CodemodWhereInputSchema.optional(),
}).strict() ;

export const CodemodDeleteManyArgsSchema: z.ZodType<Prisma.CodemodDeleteManyArgs> = z.object({
  where: CodemodWhereInputSchema.optional(),
}).strict() ;

export const CodemodVersionCreateArgsSchema: z.ZodType<Prisma.CodemodVersionCreateArgs> = z.object({
  select: CodemodVersionSelectSchema.optional(),
  include: CodemodVersionIncludeSchema.optional(),
  data: z.union([ CodemodVersionCreateInputSchema,CodemodVersionUncheckedCreateInputSchema ]),
}).strict() ;

export const CodemodVersionUpsertArgsSchema: z.ZodType<Prisma.CodemodVersionUpsertArgs> = z.object({
  select: CodemodVersionSelectSchema.optional(),
  include: CodemodVersionIncludeSchema.optional(),
  where: CodemodVersionWhereUniqueInputSchema,
  create: z.union([ CodemodVersionCreateInputSchema,CodemodVersionUncheckedCreateInputSchema ]),
  update: z.union([ CodemodVersionUpdateInputSchema,CodemodVersionUncheckedUpdateInputSchema ]),
}).strict() ;

export const CodemodVersionCreateManyArgsSchema: z.ZodType<Prisma.CodemodVersionCreateManyArgs> = z.object({
  data: z.union([ CodemodVersionCreateManyInputSchema,CodemodVersionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const CodemodVersionDeleteArgsSchema: z.ZodType<Prisma.CodemodVersionDeleteArgs> = z.object({
  select: CodemodVersionSelectSchema.optional(),
  include: CodemodVersionIncludeSchema.optional(),
  where: CodemodVersionWhereUniqueInputSchema,
}).strict() ;

export const CodemodVersionUpdateArgsSchema: z.ZodType<Prisma.CodemodVersionUpdateArgs> = z.object({
  select: CodemodVersionSelectSchema.optional(),
  include: CodemodVersionIncludeSchema.optional(),
  data: z.union([ CodemodVersionUpdateInputSchema,CodemodVersionUncheckedUpdateInputSchema ]),
  where: CodemodVersionWhereUniqueInputSchema,
}).strict() ;

export const CodemodVersionUpdateManyArgsSchema: z.ZodType<Prisma.CodemodVersionUpdateManyArgs> = z.object({
  data: z.union([ CodemodVersionUpdateManyMutationInputSchema,CodemodVersionUncheckedUpdateManyInputSchema ]),
  where: CodemodVersionWhereInputSchema.optional(),
}).strict() ;

export const CodemodVersionDeleteManyArgsSchema: z.ZodType<Prisma.CodemodVersionDeleteManyArgs> = z.object({
  where: CodemodVersionWhereInputSchema.optional(),
}).strict() ;

export const TagCreateArgsSchema: z.ZodType<Prisma.TagCreateArgs> = z.object({
  select: TagSelectSchema.optional(),
  data: z.union([ TagCreateInputSchema,TagUncheckedCreateInputSchema ]),
}).strict() ;

export const TagUpsertArgsSchema: z.ZodType<Prisma.TagUpsertArgs> = z.object({
  select: TagSelectSchema.optional(),
  where: TagWhereUniqueInputSchema,
  create: z.union([ TagCreateInputSchema,TagUncheckedCreateInputSchema ]),
  update: z.union([ TagUpdateInputSchema,TagUncheckedUpdateInputSchema ]),
}).strict() ;

export const TagCreateManyArgsSchema: z.ZodType<Prisma.TagCreateManyArgs> = z.object({
  data: z.union([ TagCreateManyInputSchema,TagCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const TagDeleteArgsSchema: z.ZodType<Prisma.TagDeleteArgs> = z.object({
  select: TagSelectSchema.optional(),
  where: TagWhereUniqueInputSchema,
}).strict() ;

export const TagUpdateArgsSchema: z.ZodType<Prisma.TagUpdateArgs> = z.object({
  select: TagSelectSchema.optional(),
  data: z.union([ TagUpdateInputSchema,TagUncheckedUpdateInputSchema ]),
  where: TagWhereUniqueInputSchema,
}).strict() ;

export const TagUpdateManyArgsSchema: z.ZodType<Prisma.TagUpdateManyArgs> = z.object({
  data: z.union([ TagUpdateManyMutationInputSchema,TagUncheckedUpdateManyInputSchema ]),
  where: TagWhereInputSchema.optional(),
}).strict() ;

export const TagDeleteManyArgsSchema: z.ZodType<Prisma.TagDeleteManyArgs> = z.object({
  where: TagWhereInputSchema.optional(),
}).strict() ;

export const TokenMetadataCreateArgsSchema: z.ZodType<Prisma.TokenMetadataCreateArgs> = z.object({
  select: TokenMetadataSelectSchema.optional(),
  data: z.union([ TokenMetadataCreateInputSchema,TokenMetadataUncheckedCreateInputSchema ]),
}).strict() ;

export const TokenMetadataUpsertArgsSchema: z.ZodType<Prisma.TokenMetadataUpsertArgs> = z.object({
  select: TokenMetadataSelectSchema.optional(),
  where: TokenMetadataWhereUniqueInputSchema,
  create: z.union([ TokenMetadataCreateInputSchema,TokenMetadataUncheckedCreateInputSchema ]),
  update: z.union([ TokenMetadataUpdateInputSchema,TokenMetadataUncheckedUpdateInputSchema ]),
}).strict() ;

export const TokenMetadataCreateManyArgsSchema: z.ZodType<Prisma.TokenMetadataCreateManyArgs> = z.object({
  data: z.union([ TokenMetadataCreateManyInputSchema,TokenMetadataCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const TokenMetadataDeleteArgsSchema: z.ZodType<Prisma.TokenMetadataDeleteArgs> = z.object({
  select: TokenMetadataSelectSchema.optional(),
  where: TokenMetadataWhereUniqueInputSchema,
}).strict() ;

export const TokenMetadataUpdateArgsSchema: z.ZodType<Prisma.TokenMetadataUpdateArgs> = z.object({
  select: TokenMetadataSelectSchema.optional(),
  data: z.union([ TokenMetadataUpdateInputSchema,TokenMetadataUncheckedUpdateInputSchema ]),
  where: TokenMetadataWhereUniqueInputSchema,
}).strict() ;

export const TokenMetadataUpdateManyArgsSchema: z.ZodType<Prisma.TokenMetadataUpdateManyArgs> = z.object({
  data: z.union([ TokenMetadataUpdateManyMutationInputSchema,TokenMetadataUncheckedUpdateManyInputSchema ]),
  where: TokenMetadataWhereInputSchema.optional(),
}).strict() ;

export const TokenMetadataDeleteManyArgsSchema: z.ZodType<Prisma.TokenMetadataDeleteManyArgs> = z.object({
  where: TokenMetadataWhereInputSchema.optional(),
}).strict() ;

export const UserLoginIntentCreateArgsSchema: z.ZodType<Prisma.UserLoginIntentCreateArgs> = z.object({
  select: UserLoginIntentSelectSchema.optional(),
  data: z.union([ UserLoginIntentCreateInputSchema,UserLoginIntentUncheckedCreateInputSchema ]).optional(),
}).strict() ;

export const UserLoginIntentUpsertArgsSchema: z.ZodType<Prisma.UserLoginIntentUpsertArgs> = z.object({
  select: UserLoginIntentSelectSchema.optional(),
  where: UserLoginIntentWhereUniqueInputSchema,
  create: z.union([ UserLoginIntentCreateInputSchema,UserLoginIntentUncheckedCreateInputSchema ]),
  update: z.union([ UserLoginIntentUpdateInputSchema,UserLoginIntentUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserLoginIntentCreateManyArgsSchema: z.ZodType<Prisma.UserLoginIntentCreateManyArgs> = z.object({
  data: z.union([ UserLoginIntentCreateManyInputSchema,UserLoginIntentCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserLoginIntentDeleteArgsSchema: z.ZodType<Prisma.UserLoginIntentDeleteArgs> = z.object({
  select: UserLoginIntentSelectSchema.optional(),
  where: UserLoginIntentWhereUniqueInputSchema,
}).strict() ;

export const UserLoginIntentUpdateArgsSchema: z.ZodType<Prisma.UserLoginIntentUpdateArgs> = z.object({
  select: UserLoginIntentSelectSchema.optional(),
  data: z.union([ UserLoginIntentUpdateInputSchema,UserLoginIntentUncheckedUpdateInputSchema ]),
  where: UserLoginIntentWhereUniqueInputSchema,
}).strict() ;

export const UserLoginIntentUpdateManyArgsSchema: z.ZodType<Prisma.UserLoginIntentUpdateManyArgs> = z.object({
  data: z.union([ UserLoginIntentUpdateManyMutationInputSchema,UserLoginIntentUncheckedUpdateManyInputSchema ]),
  where: UserLoginIntentWhereInputSchema.optional(),
}).strict() ;

export const UserLoginIntentDeleteManyArgsSchema: z.ZodType<Prisma.UserLoginIntentDeleteManyArgs> = z.object({
  where: UserLoginIntentWhereInputSchema.optional(),
}).strict() ;

export const TokenRevocationCreateArgsSchema: z.ZodType<Prisma.TokenRevocationCreateArgs> = z.object({
  select: TokenRevocationSelectSchema.optional(),
  data: z.union([ TokenRevocationCreateInputSchema,TokenRevocationUncheckedCreateInputSchema ]),
}).strict() ;

export const TokenRevocationUpsertArgsSchema: z.ZodType<Prisma.TokenRevocationUpsertArgs> = z.object({
  select: TokenRevocationSelectSchema.optional(),
  where: TokenRevocationWhereUniqueInputSchema,
  create: z.union([ TokenRevocationCreateInputSchema,TokenRevocationUncheckedCreateInputSchema ]),
  update: z.union([ TokenRevocationUpdateInputSchema,TokenRevocationUncheckedUpdateInputSchema ]),
}).strict() ;

export const TokenRevocationCreateManyArgsSchema: z.ZodType<Prisma.TokenRevocationCreateManyArgs> = z.object({
  data: z.union([ TokenRevocationCreateManyInputSchema,TokenRevocationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const TokenRevocationDeleteArgsSchema: z.ZodType<Prisma.TokenRevocationDeleteArgs> = z.object({
  select: TokenRevocationSelectSchema.optional(),
  where: TokenRevocationWhereUniqueInputSchema,
}).strict() ;

export const TokenRevocationUpdateArgsSchema: z.ZodType<Prisma.TokenRevocationUpdateArgs> = z.object({
  select: TokenRevocationSelectSchema.optional(),
  data: z.union([ TokenRevocationUpdateInputSchema,TokenRevocationUncheckedUpdateInputSchema ]),
  where: TokenRevocationWhereUniqueInputSchema,
}).strict() ;

export const TokenRevocationUpdateManyArgsSchema: z.ZodType<Prisma.TokenRevocationUpdateManyArgs> = z.object({
  data: z.union([ TokenRevocationUpdateManyMutationInputSchema,TokenRevocationUncheckedUpdateManyInputSchema ]),
  where: TokenRevocationWhereInputSchema.optional(),
}).strict() ;

export const TokenRevocationDeleteManyArgsSchema: z.ZodType<Prisma.TokenRevocationDeleteManyArgs> = z.object({
  where: TokenRevocationWhereInputSchema.optional(),
}).strict() ;

export const CodeDiffCreateArgsSchema: z.ZodType<Prisma.CodeDiffCreateArgs> = z.object({
  select: CodeDiffSelectSchema.optional(),
  data: z.union([ CodeDiffCreateInputSchema,CodeDiffUncheckedCreateInputSchema ]),
}).strict() ;

export const CodeDiffUpsertArgsSchema: z.ZodType<Prisma.CodeDiffUpsertArgs> = z.object({
  select: CodeDiffSelectSchema.optional(),
  where: CodeDiffWhereUniqueInputSchema,
  create: z.union([ CodeDiffCreateInputSchema,CodeDiffUncheckedCreateInputSchema ]),
  update: z.union([ CodeDiffUpdateInputSchema,CodeDiffUncheckedUpdateInputSchema ]),
}).strict() ;

export const CodeDiffCreateManyArgsSchema: z.ZodType<Prisma.CodeDiffCreateManyArgs> = z.object({
  data: z.union([ CodeDiffCreateManyInputSchema,CodeDiffCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const CodeDiffDeleteArgsSchema: z.ZodType<Prisma.CodeDiffDeleteArgs> = z.object({
  select: CodeDiffSelectSchema.optional(),
  where: CodeDiffWhereUniqueInputSchema,
}).strict() ;

export const CodeDiffUpdateArgsSchema: z.ZodType<Prisma.CodeDiffUpdateArgs> = z.object({
  select: CodeDiffSelectSchema.optional(),
  data: z.union([ CodeDiffUpdateInputSchema,CodeDiffUncheckedUpdateInputSchema ]),
  where: CodeDiffWhereUniqueInputSchema,
}).strict() ;

export const CodeDiffUpdateManyArgsSchema: z.ZodType<Prisma.CodeDiffUpdateManyArgs> = z.object({
  data: z.union([ CodeDiffUpdateManyMutationInputSchema,CodeDiffUncheckedUpdateManyInputSchema ]),
  where: CodeDiffWhereInputSchema.optional(),
}).strict() ;

export const CodeDiffDeleteManyArgsSchema: z.ZodType<Prisma.CodeDiffDeleteManyArgs> = z.object({
  where: CodeDiffWhereInputSchema.optional(),
}).strict() ;