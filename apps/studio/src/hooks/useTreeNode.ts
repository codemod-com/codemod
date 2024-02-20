import { useMemo } from "react";
import {
	isParsedResultFile,
	type FileParseResult,
	type ParseError,
} from "../utils/babelParser";
import mapBabelASTToRenderableTree from "../utils/mappers";

function useTreeNode(astOutput: FileParseResult | ParseError | null) {
	const res = useMemo(() => {
		if (!isParsedResultFile(astOutput)) {
			return null;
		}
		return mapBabelASTToRenderableTree(astOutput);
	}, [astOutput]);

	return res;
}

export default useTreeNode;
