import { constructAstGrep, constructReplaceWith } from "./astGrepCommands";
import { constructMap } from "./genericCommands";
import { constructBranches, constructRepositories } from "./gitCommands";
import { constructJsFiles } from "./jsCommands";

const initMap = constructMap({});
const initReplaceWith = constructReplaceWith({});
const initAstGrep = constructAstGrep({
  /**
   * @see {@link replaceWith}
   */
  replaceWith: initReplaceWith,
  /**
   * @see {@link map}
   */
  map: initMap,
});
const initJsFiles = constructJsFiles({
  /**
   * @see {@link astGrep}
   */
  astGrep: initAstGrep,
  /**
   * @see {@link map}
   */
  map: initMap,
});
const initBranches = constructBranches({
  /**
   * @see {@link jsFiles}
   */
  jsFiles: initJsFiles,
});
const initRepositories = constructRepositories({
  /**
   * @see {@link branches}
   */
  branches: initBranches,
  /**
   * @see {@link jsFiles}
   */
  jsFiles: initJsFiles,
});

/**
 * Map over all items and return array of results
 * @example
 * ```
 *   const fileNames = await jsFiles`**\/*.ts`.map(() => getFileContext().file);
 * ```
 */
export const map = initMap();

/**
 * Replace every occurence of astGrep pattern with provided pattern
 * @example
 * ```
 *   await astGrep`console.log($A)`.replaceWith`console.error($A)`;
 * ```
 */
export const replaceWith = initReplaceWith();

/**
 * Find all occurences of pattern in current file
 * @example
 * ```
 *   await astGrep`console.log($A)`;
 * ```
 */
export const astGrep = initAstGrep();

/**
 * Walk through all js files in the repository that match glob pattern
 * @example
 * ```
 *   const files = await jsFiles`**\/*.ts`;
 *   await files
 *     .astGrep`console.log($A)`
 *     .replaceWith`console.error($A)`;
 * ```
 * ```
 *   await jsFiles`**\/*.ts`
 *     .astGrep`console.log($A)`
 *     .replaceWith`console.error($A)`;
 * ```
 */
export const jsFiles = initJsFiles();

/**
 * Create a branch in current repository and checkout to it
 * @example
 * ```
 *   await repositories`https://github.com/codemod-com/codemod.git`
 *     .branches`new-branch`;
 * ```
 */
export const branches = initBranches();

/**
 * Clone repositories to temporary directory
 * @example
 * ```
 *   const codemodRepositoriesReference = repositories`https://github.com/codemod-com/codemod.git`;
 *   await codemodRepositoriesReference;
 * ```
 */
export const repositories = initRepositories();
