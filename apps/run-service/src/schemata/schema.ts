import {
  codemodRunBodySchema,
  codemodRunStatusSchema,
  validateCodemodStatusParamsSchema,
} from "@codemod-com/utilities";

import { parse } from "valibot";

export const parseCodemodRunBody = (input: unknown) =>
  parse(codemodRunBodySchema, input);

export const parseCodemodStatusParams = (input: unknown) =>
  parse(validateCodemodStatusParamsSchema, input);

export const parseCodemodStatusData = (input: unknown) =>
  parse(codemodRunStatusSchema, input);
