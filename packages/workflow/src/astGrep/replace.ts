import * as fs from "node:fs/promises";
import { PLazy } from "../PLazy.js";
import {
  getAstGrepNodeContext,
  getFileContext,
  getParentContext,
} from "../contexts.js";
import { clc, wrapHelpers } from "../helpers.js";
import { map } from "./map.js";

const helpers = { map };

type Helpers = typeof helpers;

export function replace(
  rawReplacement: string | Readonly<string[]>,
): PLazy<Helpers> & Helpers {
  const innerParentContext = getParentContext();

  const replacement =
    typeof rawReplacement === "string"
      ? rawReplacement
      : rawReplacement.join("");

  const context = async (cb?: any) => {
    await innerParentContext(async () => {
      const astGrepNodeContext = getAstGrepNodeContext();

      if (astGrepNodeContext.node) {
        const text = replacement.replace(
          /(\$\$)?\$([A-Z]+)/gm,
          // @ts-ignore
          (match, isMultiMatch, varName) => {
            if (isMultiMatch) {
              return astGrepNodeContext.node
                ?.getMultipleMatches(varName)
                .map((n) => n.text())
                .join(" ");
            }

            return astGrepNodeContext.node?.getMatch(varName)?.text() || "";
          },
        );

        const transformed =
          astGrepNodeContext.contents.substring(
            0,
            astGrepNodeContext.node?.range().start.index,
          ) +
          text +
          astGrepNodeContext.contents.substring(
            astGrepNodeContext.node?.range().end.index || 0,
          );

        const { file } = getFileContext();
        astGrepNodeContext.contents = transformed;

        await fs.writeFile(file, transformed);
        console.log(`${clc.blueBright("FILE")} ${file}`);
      }
    });

    if (cb) {
      await innerParentContext(() => cb());
    }

    return helpersWithContext;
  };

  const helpersWithContext = wrapHelpers(helpers, context);

  const promise = new PLazy<Helpers>((resolve, reject) => {
    context().then(resolve).catch(reject);
  }) as PLazy<Helpers> & Helpers;

  Object.keys(helpersWithContext).forEach((key) => {
    // @ts-ignore
    promise[key] = helpersWithContext[key];
  });

  return promise;
}
