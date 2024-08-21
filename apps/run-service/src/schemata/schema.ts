import {
  codemodRunBodySchema,
  codemodRunStatusSchema,
  validateCodemodStatusParamsSchema,
} from "@codemod-com/api-types";

import { parse } from "valibot";

export const parseCodemodRunBody = (input: unknown) => {
  const { codemodArguments, ...rest } = parse(codemodRunBodySchema, input);
  let argumentsJson:
    | {
        [key: string]:
          | string
          | number
          | boolean
          | (string | number | boolean)[];
      }
    | undefined;
  try {
    if (codemodArguments) {
      argumentsJson = codemodArguments && (JSON.parse(codemodArguments) as any);
    }
  } catch (e) {
    //
  }

  return { ...rest, codemodArguments: argumentsJson };
};

export const parseCodemodStatusParams = (input: unknown) =>
  parse(validateCodemodStatusParamsSchema, input);

export const parseCodemodStatusData = (input: unknown) =>
  parse(codemodRunStatusSchema, input);
