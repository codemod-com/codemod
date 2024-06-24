import {
  type Output,
  array,
  coerce,
  number,
  object,
  optional,
  string,
} from "valibot";

export const SearchQuery = object({
  q: optional(coerce(string(), (input) => String(input))),
  category: optional(
    coerce(array(string()), (input) =>
      Array.isArray(input) ? input : [input],
    ),
  ),
  owner: optional(
    coerce(array(string()), (input) =>
      Array.isArray(input) ? input : [input],
    ),
  ),
  framework: optional(
    coerce(array(string()), (input) =>
      Array.isArray(input) ? input : [input],
    ),
  ),
  page: optional(coerce(number(), (input) => Number(input))),
  size: optional(coerce(number(), (input) => Number(input))),
});

export type SearchQuery = Output<typeof SearchQuery>;
