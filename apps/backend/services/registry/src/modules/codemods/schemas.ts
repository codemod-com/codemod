import { type Output, object, optional, string } from "valibot";

export const GetCodemodParams = object({
  slug: string(),
});

export type GetCodemodParams = Output<typeof GetCodemodParams>;

export const GetCodemodsListParams = object({
  q: optional(string()),
});

export type GetCodemodsListParams = Output<typeof GetCodemodsListParams>;

export const GetCodemodDownloadLinkQuery = object({
  name: string(),
});

export type GetCodemodDownloadLinkQuery = Output<
  typeof GetCodemodDownloadLinkQuery
>;
