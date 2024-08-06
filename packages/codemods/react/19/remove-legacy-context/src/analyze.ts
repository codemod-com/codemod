import type { Collection, JSCodeshift } from "jscodeshift";

import {
  getClassComponents,
  getClassMethod,
  getClassProperty,
} from "@codemod.com/codemod-utils";

export const findPatterns = (j: JSCodeshift, root: Collection) =>
  getClassComponents(j, root)
    ?.paths()
    .map((path) => {
      const childContextTypes = getClassProperty(j, path, "childContextTypes");
      const getChildContext = getClassMethod(j, path, "getChildContext");

      if (!childContextTypes || !getChildContext) {
        return;
      }

      return {
        classComponent: path,
        childContextTypes,
        getChildContext,
      };
    })
    .filter(Boolean);
