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
}
