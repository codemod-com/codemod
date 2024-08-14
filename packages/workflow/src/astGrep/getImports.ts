import { astGrep } from "./astGrep.js";

/**
 * Same as astGrep, but searches with single and double quotes
 * @deprecated
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
