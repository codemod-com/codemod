import type { Api } from "@codemod.com/workflow";

export async function workflow({ jsFiles }: Api) {
  await jsFiles().astGrep({
    rule: {
      pattern: "const $_ = $_",
      regex: "query\\?\\.",
      follows: {
        pattern: "const query = buildQuery($$$_)",
        stopBy: "end",
      },
    },
  }).ai`
Previously query parameters were not typed. So we had to use optional chaining to access query parameters.
const someVariable1 = query?.['some-variable'] === 'true';
const anotherVariable = query?.['another-variable'] === 'true';

Now we are using zod to type query parameters. So we can remove the optional chaining and use zod to validate query parameters:
import { z } from 'zod';
const querySchema = z.object({
  'some-variable': z.string(),
  'another-variable': z.string(),
});
const parsedQuery = querySchema.parse(query);
const someVariable1 = parsedQuery['some-variable'] === 'true';
const anotherVariable = parsedQuery['another-variable'] === 'true';

You have to:
1. Add zod import statement.
2. Add zod schema for query parameters.
3. Parse query using zod schema.
4. Remove optional chaining and use parsed query instead.
5. Add new line between lines of code.
`;

  await jsFiles().astGrep({
    rule: {
      pattern: "return { $$$_ }",
      regex: "query\\.",
      follows: {
        pattern: "const query = buildQuery($$$_)",
        stopBy: "end",
      },
    },
  }).ai`
Previously query parameters were not typed.
return {
api,
param1: query.param1,
someOtherParam: query.some_other_param,
andSoOnParams: query.and_so_on_params,
user: selectCurrentUser(state),
}

Now we are using zod to type query parameters:
import { z } from 'zod';
const querySchema = z.object({
'param1': z.string(),
'some_other_param': z.string(),
'and_so_on_params': z.string(),
});
const parsedQuery = querySchema.parse(query);
return {
api,
param1: parsedQuery.param1,
someOtherParam: parsedQuery.some_other_param,
andSoOnParams: parsedQuery.and_so_on_params,
user: selectCurrentUser(state),
}

You have to:
1. Add zod import statement.
2. Add zod schema for query parameters.
3. Parse query using zod schema.
4. Remove optional chaining and use parsed query instead.
5. Add new line between lines of code.
`;

  await jsFiles().astGrep("const { $$$_ } = buildQuery($$$_)").ai`
Previously query parameters were not typed:
const { param1, another_param } = buildQuery(ownProps.location.search);

Now we are using zod to type query parameters:
import { z } from 'zod;
const querySchema = z.object({
  param1: z.string(),
  another_param: z.string(), 
})
const query = buildQuery(ownProps.location.search);
const parsedQuery = querySchema.parse(query);
const { search, page } = parsedQuery

You have to:
1. Add zod import statement.
2. Add zod schema for query parameters.
3. Parse query using zod schema.
4. Remove optional chaining and use parsed query instead.
5. Add new line between lines of code.
`;
}
