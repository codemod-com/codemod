import { isFile } from "@babel/types";
import { useMemo } from "react";
import type { FileParseResult, ParseError } from "../utils/babelParser";
import mapBabelASTToRenderableTree from "../utils/mappers";

function useTreeNode(astOutput: FileParseResult | ParseError | null) {
  let res = useMemo(() => {
    if (!isFile(astOutput)) {
      return null;
    }
    return mapBabelASTToRenderableTree(astOutput);
  }, [astOutput]);

  return res;
}

export default useTreeNode;
