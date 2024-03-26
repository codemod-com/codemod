import { useToggleVisibility } from "~/hooks/useToggleVisibility";
import ASTViewer from "~/pageComponents/main/ASTViewer";
import {
	ContentViewerVariant,
	PanelData,
	ResizablePanelsIndices,
} from "~/pageComponents/main/PageBottomPane/utils/types";
import { JSEngine } from "~/types/Engine";
import { Repeat } from "~/types/transformations";

export const getContent = (type: ContentViewerVariant) => (engine: JSEngine) =>
	engine === "jscodeshift" ? (
		<ASTViewer type={type} />
	) : (
		"The AST View is not yet supported for tsmorph"
	);

export const usePanels = () => {
	const beforePanel: PanelData = {
		relatedAST: ResizablePanelsIndices.BEFORE_AST,
		boundIndex: ResizablePanelsIndices.BEFORE_AST,
		snippedIndex: ResizablePanelsIndices.BEFORE_SNIPPET,
		type: "before",
		hasBoundResize: true,
		// visibilityOptions: useToggleVisibility(),
		content: getContent("before"),
	};

	const afterPanel: Required<PanelData> = {
		relatedAST: ResizablePanelsIndices.AFTER_AST,
		boundIndex: ResizablePanelsIndices.CODE_SECTION,
		snippedIndex: ResizablePanelsIndices.AFTER_SNIPPET,
		type: "after",
		hasBoundResize: false,
		content: getContent("after"),
		visibilityOptions: useToggleVisibility(),
	};

	const outputPanel: PanelData = {
		relatedAST: ResizablePanelsIndices.OUTPUT_AST,
		boundIndex: ResizablePanelsIndices.OUTPUT_AST,
		snippedIndex: ResizablePanelsIndices.OUTPUT_SNIPPET,
		type: "output",
		content: getContent("output"),
	};

	const panels: Repeat<PanelData, 3> = [beforePanel, afterPanel, outputPanel];

	return {
		panels,
		beforePanel,
		afterPanel,
		outputPanel,
	};
};
