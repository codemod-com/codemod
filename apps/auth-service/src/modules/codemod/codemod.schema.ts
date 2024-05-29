import {
  type InferOutput,
  array,
  boolean,
  number,
  object,
  optional,
  parse,
  pipe,
  string,
  transform,
  union,
} from "valibot";

export const searchCodemodsSchema = object({
  search: optional(string()),
  category: optional(
    pipe(
      union([string(), array(string())]),
      transform((input) => (Array.isArray(input) ? input : [input])),
    ),
  ),
  author: optional(
    pipe(
      union([string(), array(string())]),
      transform((input) => (Array.isArray(input) ? input : [input])),
    ),
  ),
  framework: optional(
    pipe(
      union([string(), array(string())]),
      transform((input) => (Array.isArray(input) ? input : [input])),
    ),
  ),
  page: optional(
    pipe(
      number(),
      transform((input) => Number(input)),
    ),
  ),
  size: optional(
    pipe(
      number(),
      transform((input) => Number(input)),
    ),
  ),
});
export type SearchCodemodsData = InferOutput<typeof searchCodemodsSchema>;
export const parseSearchCodemodsData = (input: unknown) =>
  parse(searchCodemodsSchema, input);

export const getCodemodBySlugSchema = object({
  slug: string(),
});
export type GetCodemodBySlugData = InferOutput<typeof getCodemodBySlugSchema>;
export const parseGetCodemodBySlugData = (input: unknown) =>
  parse(getCodemodBySlugSchema, input);

export const getCodemodDownloadLinkSchema = object({
  name: string(),
});
export type GetCodemodDownloadLinkData = InferOutput<
  typeof getCodemodDownloadLinkSchema
>;
export const parseGetCodemodDownloadLinkData = (input: unknown) =>
  parse(getCodemodDownloadLinkSchema, input);
