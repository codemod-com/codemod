import { type Output, object, string } from "valibot";

export const GetCodemodParams = object({
  slug: string(),
});

export type GetCodemodParams = Output<typeof GetCodemodParams>;
