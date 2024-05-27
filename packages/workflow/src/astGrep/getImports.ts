import { astGrep } from "./astGrep";

/**
 * Same as astGrep, but searches with single and double quotes
 * @example
 * ```ts
 * await getImports("import React from 'react'");
 * // is equal to
 * await astGrep("import React from 'react'");
 * // and
 * await astGrep('import React from "react"');
 * ```
 */
export function getImports(source: string) {
  return astGrep({
    rule: {
      any: [
        { pattern: source.replace(/"/g, "'") },
        { pattern: source.replace(/'/g, '"') },
      ],
    },
  });
}
